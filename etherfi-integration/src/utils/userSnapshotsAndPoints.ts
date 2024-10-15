import { EthChainId, EthContext, isNullAddress } from "@sentio/sdk/eth";
import { erc20 } from "@sentio/sdk/eth/builtin";
import { DeriveVaultUserSnapshot } from "../schema/store.js";
import { LYRA_VAULTS, MILLISECONDS_PER_DAY, VAULT_POOLS, VaultConfig } from "../config.js";
import { toUnderlyingBalance } from "./vaultTokenPrice.js";
import { getAddress } from "ethers";
import { BigDecimal } from "@sentio/sdk";
import { getSwellSimpleStakingContract } from "../types/eth/swellsimplestaking.js";

export async function updateUserSnapshotAndEmitPointUpdate(ctx: EthContext, vaultName: string, vaultTokenAddress: string, owner: string) {
    let [oldSnapshot, newSnapshot] = await updateDeriveVaultUserSnapshot(ctx, vaultName, vaultTokenAddress, owner)
    emitUserPointUpdate(ctx, LYRA_VAULTS[vaultName], oldSnapshot, newSnapshot)
}

export async function updateDeriveVaultUserSnapshot(ctx: EthContext, vaultName: keyof typeof LYRA_VAULTS, vaultTokenAddress: string, owner: string): Promise<[DeriveVaultUserSnapshot?, DeriveVaultUserSnapshot?]> {
    vaultTokenAddress = getAddress(vaultTokenAddress)

    if (isNullAddress(owner)) return [undefined, undefined];

    const vaultTokenContractView = erc20.getERC20ContractOnContext(ctx, vaultTokenAddress)
    let currentTimestampMs = BigInt(ctx.timestamp.getTime())
    let currentVaultTokenBalance = (await vaultTokenContractView.balanceOf(owner)).scaleDown(18)
    let currentSwellL2Balance = await getSwellL2Balance(ctx, owner, vaultTokenAddress)
    let totalBalance = currentSwellL2Balance.plus(currentVaultTokenBalance)
    let underlyingBalance = await toUnderlyingBalance(ctx, LYRA_VAULTS[vaultName].lyra, totalBalance, currentTimestampMs)

    let lastSnapshot = await ctx.store.get(DeriveVaultUserSnapshot, `${owner}-${vaultTokenAddress}`)

    if (lastSnapshot) {
        // deep clone to avoid mutation
        lastSnapshot = new DeriveVaultUserSnapshot({
            id: lastSnapshot.id,
            owner: lastSnapshot.owner,
            vaultName: lastSnapshot.vaultName,
            vaultAddress: lastSnapshot.vaultAddress,
            timestampMs: lastSnapshot.timestampMs,
            vaultBalance: lastSnapshot.vaultBalance,
            weETHEffectiveBalance: lastSnapshot.weETHEffectiveBalance
        })
    }

    let newSnapshot = new DeriveVaultUserSnapshot(
        {
            id: `${owner}-${vaultTokenAddress}`,
            owner: owner,
            vaultName: vaultName,
            vaultAddress: vaultTokenAddress,
            timestampMs: currentTimestampMs,
            vaultBalance: totalBalance,
            weETHEffectiveBalance: underlyingBalance
        }
    )

    await ctx.store.upsert(newSnapshot)

    return [lastSnapshot, newSnapshot]
}

export function emitUserPointUpdate(ctx: EthContext, vaultConfig: VaultConfig, lastSnapshot: DeriveVaultUserSnapshot | undefined, newSnapshot: DeriveVaultUserSnapshot | undefined) {
    if (!lastSnapshot || !newSnapshot) return;

    if (lastSnapshot.vaultBalance.isZero()) return;

    const elapsedDays = (Number(newSnapshot.timestampMs) - Number(lastSnapshot.timestampMs)) / MILLISECONDS_PER_DAY
    const earnedEtherfiPoints = elapsedDays * vaultConfig.etherfiPointsPerDay * lastSnapshot.weETHEffectiveBalance.toNumber()
    const earnedEigenlayerPoints = elapsedDays * vaultConfig.eigenlayerPointsPerDay * lastSnapshot.weETHEffectiveBalance.toNumber()
    ctx.eventLogger.emit("point_update", {
        account: lastSnapshot.owner,
        assetAndSubIdOrVaultAddress: lastSnapshot.vaultAddress,

        // earned points
        earnedEtherfiPoints: earnedEtherfiPoints,
        earnedEigenlayerPoints: earnedEigenlayerPoints,
        earnedLombardPoints: 0,
        earnedBabylonPoints: 0,
        // last snapshot
        lastTimestampMs: lastSnapshot.timestampMs,
        lastBalance: lastSnapshot.vaultBalance,
        lastEffectiveBalance: lastSnapshot.weETHEffectiveBalance,
        // new snapshot
        newTimestampMs: newSnapshot.timestampMs,
        newBalance: newSnapshot.vaultBalance,
        newEffectiveBalance: newSnapshot.weETHEffectiveBalance,
    });
}

async function getSwellL2Balance(ctx: EthContext, owner: string, vaultToken: string): Promise<BigDecimal> {
    if (ctx.chainId != VAULT_POOLS["SWELL_L2"].chainId) {
        return new BigDecimal(0)
    }

    const swellSimpleStakingContract = getSwellSimpleStakingContract(EthChainId.BITLAYER, VAULT_POOLS["SWELL_L2"].address)
    const stakedBalance = (await swellSimpleStakingContract.stakedBalances(owner, vaultToken)).scaleDown(18)

    if (!stakedBalance.isZero()) {
        ctx.eventLogger.emit("swell_simple_staking_update", {
            account: owner,
            vaultToken: vaultToken,
            stakedBalance: stakedBalance,
            timestampMs: BigInt(ctx.timestamp.getTime())
        })
    }
    return stakedBalance
}