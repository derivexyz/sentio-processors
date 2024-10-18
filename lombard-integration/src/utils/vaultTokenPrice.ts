import { EthChainId, EthContext, getProvider } from "@sentio/sdk/eth"
import { DeriveVaultTokenPrice } from "../schema/store.js"
import { getDeriveVaultTokenContract } from "../types/eth/derivevaulttoken.js"
import { MILLISECONDS_PER_DAY } from "../config.js"
import { estimateBlockNumberAtDate, VaultConfig } from "@derivefinance/derive-sentio-utils"
import { BigDecimal } from "@sentio/sdk"
import { getAddress } from "ethers"


export async function saveCurrentVaultTokenPrice(ctx: EthContext, vaultDetails: VaultConfig) {
    const nowMs = ctx.timestamp.getTime()
    const nowMsBigInt = BigInt(nowMs)
    const vaultTokenAddress = getAddress(vaultDetails.derive)
    const deriveChainId = vaultDetails.deriveChainId
    const predepositUpgradeTimestampMs = vaultDetails.predepositUpgradeTimestampMs

    // Skip saving if Pre-Deposit Upgrade not yet enabled
    if (predepositUpgradeTimestampMs && nowMsBigInt < BigInt(predepositUpgradeTimestampMs)) {
        // console.log(`Skipping token price save at time ${nowMsBigInt} for ${vaultTokenAddress} as it's before pre-deposit upgrade`)
        return
    }

    // This is taken exclusively from the Lyra Chain
    const vaultTokenContract = getDeriveVaultTokenContract(deriveChainId, vaultTokenAddress)
    try {
        const lyraProvider = getProvider(deriveChainId)
        const lyraBlock = await estimateBlockNumberAtDate(lyraProvider, new Date(nowMs))
        const oneShare = '1' + '0'.repeat(vaultDetails.vaultDecimals);
        const shareToUnderlying = (await vaultTokenContract.getSharesValue(oneShare, { blockTag: lyraBlock })).scaleDown(vaultDetails.underlyingDecimals)
        await ctx.store.upsert(new DeriveVaultTokenPrice({
            id: `${vaultTokenAddress}-${nowMsBigInt}`,
            vaultAddress: vaultTokenAddress,
            vaultName: vaultDetails.vaultName,
            timestampMs: nowMsBigInt,
            vaultToUnderlying: shareToUnderlying
        }))

        ctx.eventLogger.emit("vault_price_update", {
            vaultAddress: vaultDetails.derive,
            vaultName: vaultDetails.vaultName,
            vaultToUnderlying: shareToUnderlying,
            timestampMs: nowMs,
        });

    } catch (e) {
        console.log(`Error calling getSharesValue for ${vaultDetails.vaultName} at ${nowMsBigInt}: ${e.message}`)
        return
    }
}


export async function toUnderlyingBalance(ctx: EthContext, vaultAddress: string, vaultBalance: BigDecimal, snapshotTimestampMs: bigint): Promise<[BigDecimal, BigDecimal]> {
    vaultAddress = getAddress(vaultAddress)

    // Gets closest vault token price +/- 1 day
    const upperBound = snapshotTimestampMs + BigInt(MILLISECONDS_PER_DAY * 5)
    const lowerBound = snapshotTimestampMs - BigInt(MILLISECONDS_PER_DAY * 5)
    const pricesNearby = await ctx.store.list(DeriveVaultTokenPrice, [
        { field: "vaultAddress", op: "=", value: vaultAddress },
        { field: "timestampMs", op: "<", value: upperBound },
        { field: "timestampMs", op: ">", value: lowerBound }
    ])

    let tokenPriceWithinBounds: DeriveVaultTokenPrice | undefined = await _find_closest_snapshot(pricesNearby, snapshotTimestampMs)

    // handle the last batch
    if (!tokenPriceWithinBounds) {
        return [vaultBalance, BigDecimal(1)]
    }
    return [tokenPriceWithinBounds.vaultToUnderlying.multipliedBy(vaultBalance), tokenPriceWithinBounds.vaultToUnderlying]
}

async function _find_closest_snapshot(pricesNearby: DeriveVaultTokenPrice[], snapshotTimestampMs: bigint): Promise<DeriveVaultTokenPrice | undefined> {
    let tokenPriceWithinBounds: DeriveVaultTokenPrice | undefined;
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

