
// Instead of using the vault token price to determine the amount of underlying held, use the spot holdings in the subaccount

import { BigDecimal } from "@sentio/sdk"
import { MILLISECONDS_PER_DAY } from "../constants.js"
import { EthChainId, EthContext, getProvider } from "@sentio/sdk/eth"
import { DeriveExchangeUserSnapshot } from "../schema/store.js"
import { erc20 } from "@sentio/sdk/eth/builtin";
import { schemas, vaults } from "../index.js";
import { getSubaccountsContract } from "../types/eth/subaccounts.js";
import { DERIVE_V2_SUBACCOUNTS_ADDRESS } from "../v2/constants.js";
import { estimateBlockNumberAtDate } from "@sentio/sdk/utils";
import { VaultConfig } from "./vaultConfig.js";
import { getDeriveVaultTokenContract } from "../types/eth/derivevaulttoken.js";

// This accounts for vaults that hold leveraged spot positions (e.g. leveraged delta-1 basis vaults)
export async function toUnderlyingBalanceWithSpotHoldings(ctx: EthContext, vaultConfig: vaults.VaultConfig, assetAndSubId: string, vaultBalance: BigDecimal, snapshotTimestampMs: bigint): Promise<BigDecimal> {
    // Gets closest vault token price +/- 1 day
    const upperBound = snapshotTimestampMs + BigInt(MILLISECONDS_PER_DAY)
    const lowerBound = snapshotTimestampMs - BigInt(MILLISECONDS_PER_DAY)
    const pricesNearby = await ctx.store.list(DeriveExchangeUserSnapshot, [
        { field: "subaccountId", op: "=", value: vaultConfig.subaccountId },
        { field: "assetAndSubId", op: "=", value: assetAndSubId },
        { field: "timestampMs", op: "<", value: upperBound },
        { field: "timestampMs", op: ">", value: lowerBound }
    ])

    let vaultExchangeBalanceWithinBounds: DeriveExchangeUserSnapshot | undefined = await _find_closest_snapshot(pricesNearby, snapshotTimestampMs)

    // handle the last batch
    if (!vaultExchangeBalanceWithinBounds) {
        return vaultBalance
    }
    const userPercentTokenSupply = await getPercentTokenSupply(ctx, vaultConfig, vaultBalance)
    const effectiveUserUnderlyingBalance = vaultExchangeBalanceWithinBounds.amount.multipliedBy(userPercentTokenSupply)

    console.log(`Found vault exchange balance: ${vaultExchangeBalanceWithinBounds}`)
    return effectiveUserUnderlyingBalance
}

async function _find_closest_snapshot(pricesNearby: DeriveExchangeUserSnapshot[], snapshotTimestampMs: bigint): Promise<DeriveExchangeUserSnapshot | undefined> {
    let tokenPriceWithinBounds: DeriveExchangeUserSnapshot | undefined;
    let timestampDiff = BigInt(Number.MAX_SAFE_INTEGER)
    for (const tokenPrice of pricesNearby) {
        let diff = snapshotTimestampMs - tokenPrice.timestampMs
        if (diff < 0) diff = -diff

        if (diff < timestampDiff) {
            timestampDiff = diff
            tokenPriceWithinBounds = tokenPrice
        }
    }
    return tokenPriceWithinBounds
}

export async function getPercentTokenSupply(ctx: EthContext, vaultConfig: vaults.VaultConfig, userVaultBalance: BigDecimal): Promise<BigDecimal> {
    const nowMs = ctx.timestamp.getTime()
    const vaultTokenContract = getDeriveVaultTokenContract(vaultConfig.deriveChainId, vaultConfig.derive)

    const deriveProvider = getProvider(vaultConfig.deriveChainId)
    const deriveBlock = await estimateBlockNumberAtDate(deriveProvider, new Date(nowMs))

    const totalSupply = (await vaultTokenContract.totalSupply({ blockTag: deriveBlock })).scaleDown(vaultConfig.vaultDecimals)

    let percentTokenSupply = userVaultBalance.div(totalSupply)
    if (percentTokenSupply.gt(BigDecimal(1))) {
        console.log(`Percent supply > 1 for ${vaultConfig.subaccountId} with user balance ${userVaultBalance} and supply ${totalSupply}`)
        return BigDecimal(1)
    }
    return percentTokenSupply
}

export async function saveVaultExchangeBalance(ctx: EthContext, vaultConfig: VaultConfig, v2AssetConfig: vaults.V2AssetConfig): Promise<void> {
    const nowMs = ctx.timestamp.getTime()
    const subaccountsContract = getSubaccountsContract(EthChainId.DERIVE, DERIVE_V2_SUBACCOUNTS_ADDRESS)
    const deriveProvider = getProvider(EthChainId.DERIVE)
    const deriveBlock = await estimateBlockNumberAtDate(deriveProvider, new Date(nowMs))

    const subaccountBalance = (await subaccountsContract.getBalance(vaultConfig.subaccountId, v2AssetConfig.assetAddress, v2AssetConfig.subId, { blockTag: deriveBlock })).scaleDown(18)

    console.log(`Saving vault exchange balance ${subaccountBalance} for ${vaultConfig.subaccountId} in chain ${ctx.chainId} storage`)

    await ctx.store.upsert(new DeriveExchangeUserSnapshot({
        id: `${vaultConfig.subaccountId}-${v2AssetConfig.assetName}-${nowMs}`,
        assetAndSubId: v2AssetConfig.assetAndSubId,
        subaccountId: vaultConfig.subaccountId,
        tokenName: v2AssetConfig.assetName,
        amount: subaccountBalance,
        eoa: "used_for_vault_spot_holdings",
        timestampMs: BigInt(nowMs),
    }))
}