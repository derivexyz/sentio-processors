import { EthChainId, EthContext, isNullAddress } from "@sentio/sdk/eth";
import { erc20 } from "@sentio/sdk/eth/builtin";
import { getAddress } from "ethers";
import { BigDecimal } from "@sentio/sdk";
import { toUnderlyingBalance } from "./tokenPrice.js";
import { schemas, vaults } from "../index.js";
import { toUnderlyingBalanceWithSpotHoldings } from "./spotHoldings.js";

export type emitPointUpdateFunction = (
    ctx: EthContext,
    vaultConfig: vaults.VaultConfig,
    lastSnapshot: schemas.DeriveVaultUserSnapshot | undefined,
    newSnapshot: schemas.DeriveVaultUserSnapshot | undefined
) => Promise<void>;

export type poolBalanceFn = (
    ctx: EthContext,
    owner: string,
    vaultTokenAddress: string
) => Promise<BigDecimal>;


export async function updateVaultUserSnapshot(ctx: EthContext, vaultConfig: vaults.VaultConfig, vaultTokenAddress: string, owner: string, excludedOwners: string[], poolBalanceFn: poolBalanceFn): Promise<[schemas.DeriveVaultUserSnapshot?, schemas.DeriveVaultUserSnapshot?]> {
    vaultTokenAddress = getAddress(vaultTokenAddress)

    if (isNullAddress(owner) || excludedOwners.includes(owner)) return [undefined, undefined];

    const vaultTokenContractView = erc20.getERC20ContractOnContext(ctx, vaultTokenAddress)
    let currentTimestampMs = BigInt(ctx.timestamp.getTime())
    let currentVaultTokenBalance = (await vaultTokenContractView.balanceOf(owner)).scaleDown(vaultConfig.vaultDecimals)
    let currentSwellL2Balance = await poolBalanceFn(ctx, owner, vaultTokenAddress)
    let totalBalance = currentSwellL2Balance.plus(currentVaultTokenBalance)
    let [underlyingBalance, _] = await toUnderlyingBalance(ctx, vaultConfig.derive, totalBalance, currentTimestampMs)

    let lastSnapshot = await ctx.store.get(schemas.DeriveVaultUserSnapshot, `${owner}-${vaultTokenAddress}`)

    if (lastSnapshot) {
        // deep clone to avoid mutation
        lastSnapshot = new schemas.DeriveVaultUserSnapshot({
            id: lastSnapshot.id,
            owner: lastSnapshot.owner,
            vaultName: lastSnapshot.vaultName,
            vaultAddress: lastSnapshot.vaultAddress,
            timestampMs: lastSnapshot.timestampMs,
            vaultBalance: lastSnapshot.vaultBalance,
            underlyingEffectiveBalance: lastSnapshot.underlyingEffectiveBalance
        })
    }

    let newSnapshot = new schemas.DeriveVaultUserSnapshot(
        {
            id: `${owner}-${vaultTokenAddress}`,
            owner: owner,
            vaultName: vaultConfig.vaultName,
            vaultAddress: vaultTokenAddress,
            timestampMs: currentTimestampMs,
            vaultBalance: totalBalance,
            underlyingEffectiveBalance: underlyingBalance
        }
    )

    await ctx.store.upsert(newSnapshot)

    return [lastSnapshot, newSnapshot]
}

// Used by vaults which leverage base holdings and require the `toUnderlyingBalanceFromSpotHoldings` helper. 
export async function updateVaultUserSnapshotWithSpotHoldings(ctx: EthContext, vaultConfig: vaults.VaultConfig, assetAndSubId: string, vaultTokenAddress: string, owner: string, excludedOwners: string[], poolBalanceFn: poolBalanceFn): Promise<[schemas.DeriveVaultUserSnapshot?, schemas.DeriveVaultUserSnapshot?]> {
    vaultTokenAddress = getAddress(vaultTokenAddress)

    if (isNullAddress(owner) || excludedOwners.includes(owner)) return [undefined, undefined];

    const vaultTokenContractView = erc20.getERC20ContractOnContext(ctx, vaultTokenAddress)
    let currentTimestampMs = BigInt(ctx.timestamp.getTime())
    let currentVaultTokenBalance = (await vaultTokenContractView.balanceOf(owner)).scaleDown(vaultConfig.vaultDecimals)
    let currentSwellL2Balance = await poolBalanceFn(ctx, owner, vaultTokenAddress)
    let totalBalance = currentSwellL2Balance.plus(currentVaultTokenBalance)
    let underlyingBalance = await toUnderlyingBalanceWithSpotHoldings(ctx, vaultConfig, assetAndSubId, currentVaultTokenBalance, currentTimestampMs)

    let lastSnapshot = await ctx.store.get(schemas.DeriveVaultUserSnapshot, `${owner}-${vaultTokenAddress}`)

    if (lastSnapshot) {
        // deep clone to avoid mutation
        lastSnapshot = new schemas.DeriveVaultUserSnapshot({
            id: lastSnapshot.id,
            owner: lastSnapshot.owner,
            vaultName: lastSnapshot.vaultName,
            vaultAddress: lastSnapshot.vaultAddress,
            timestampMs: lastSnapshot.timestampMs,
            vaultBalance: lastSnapshot.vaultBalance,
            underlyingEffectiveBalance: lastSnapshot.underlyingEffectiveBalance
        })
    }

    let newSnapshot = new schemas.DeriveVaultUserSnapshot(
        {
            id: `${owner}-${vaultTokenAddress}`,
            owner: owner,
            vaultName: vaultConfig.vaultName,
            vaultAddress: vaultTokenAddress,
            timestampMs: currentTimestampMs,
            vaultBalance: totalBalance,
            underlyingEffectiveBalance: underlyingBalance
        }
    )

    await ctx.store.upsert(newSnapshot)

    return [lastSnapshot, newSnapshot]
}