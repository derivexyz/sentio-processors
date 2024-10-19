import { EthChainId, EthContext, isNullAddress } from "@sentio/sdk/eth";
import { erc20 } from "@sentio/sdk/eth/builtin";
import { DERIVE_VAULTS, MILLISECONDS_PER_DAY, PointUpdateEvent, VAULT_POOLS, VaultName } from "../config.js";
import { getAddress } from "ethers";
import { BigDecimal } from "@sentio/sdk";
import { getSwellSimpleStakingContract } from "../types/eth/swellsimplestaking.js";
import { schemas, vaults } from "@derivefinance/derive-sentio-utils";
import { toUnderlyingBalance } from "@derivefinance/derive-sentio-utils/dist/vaults/tokenPrice.js";

export async function updateUserSnapshotAndEmitPointUpdate(ctx: EthContext, vaultName: VaultName, vaultTokenAddress: string, owner: string) {
    let [oldSnapshot, newSnapshot] = await updateDeriveVaultUserSnapshot(ctx, vaultName, vaultTokenAddress, owner)
    emitUserPointUpdate(ctx, DERIVE_VAULTS[vaultName], oldSnapshot, newSnapshot)
}

export async function updateDeriveVaultUserSnapshot(ctx: EthContext, vaultName: keyof typeof DERIVE_VAULTS, vaultTokenAddress: string, owner: string): Promise<[schemas.DeriveVaultUserSnapshot?, schemas.DeriveVaultUserSnapshot?]> {
    vaultTokenAddress = getAddress(vaultTokenAddress)

    if (isNullAddress(owner) || isVaultPool(owner)) return [undefined, undefined];

    const vaultTokenContractView = erc20.getERC20ContractOnContext(ctx, vaultTokenAddress)
    let currentTimestampMs = BigInt(ctx.timestamp.getTime())
    let currentVaultTokenBalance = (await vaultTokenContractView.balanceOf(owner)).scaleDown(18)
    let currentSwellL2Balance = await getSwellL2Balance(ctx, owner, vaultTokenAddress)
    let totalBalance = currentSwellL2Balance.plus(currentVaultTokenBalance)
    let [underlyingBalance, _] = await toUnderlyingBalance(ctx, DERIVE_VAULTS[vaultName].derive, totalBalance, currentTimestampMs)

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
            vaultName: vaultName,
            vaultAddress: vaultTokenAddress,
            timestampMs: currentTimestampMs,
            vaultBalance: totalBalance,
            underlyingEffectiveBalance: underlyingBalance
        }
    )

    await ctx.store.upsert(newSnapshot)

    return [lastSnapshot, newSnapshot]
}

export function emitUserPointUpdate(ctx: EthContext, vaultConfig: vaults.VaultConfig, lastSnapshot: schemas.DeriveVaultUserSnapshot | undefined, newSnapshot: schemas.DeriveVaultUserSnapshot | undefined) {
    if (!lastSnapshot || !newSnapshot) return;

    if (lastSnapshot.vaultBalance.isZero()) return;

    const elapsedDays = (Number(newSnapshot.timestampMs) - Number(lastSnapshot.timestampMs)) / MILLISECONDS_PER_DAY
    const earnedEtherfiPoints = elapsedDays * vaultConfig.pointMultipliersPerDay["etherfi"] * lastSnapshot.underlyingEffectiveBalance.toNumber()
    const earnedEigenlayerPoints = elapsedDays * vaultConfig.pointMultipliersPerDay["eigenlayer"] * lastSnapshot.underlyingEffectiveBalance.toNumber()

    const data: PointUpdateEvent = {
        account: lastSnapshot.owner,
        assetAndSubIdOrVaultAddress: lastSnapshot.vaultAddress,
        assetName: vaultConfig.vaultName,

        // earned points
        earnedEtherfiPoints: earnedEtherfiPoints,
        earnedEigenlayerPoints: earnedEigenlayerPoints,
        earnedLombardPoints: 0,
        earnedBabylonPoints: 0,
        // last snapshot
        lastTimestampMs: lastSnapshot.timestampMs,
        lastBalance: lastSnapshot.vaultBalance,
        lastEffectiveBalance: lastSnapshot.underlyingEffectiveBalance,

        // new snapshot
        newTimestampMs: newSnapshot.timestampMs,
        newBalance: newSnapshot.vaultBalance,
        newEffectiveBalance: newSnapshot.underlyingEffectiveBalance,

    }

    ctx.eventLogger.emit("point_update", data);
}

async function getSwellL2Balance(ctx: EthContext, owner: string, vaultToken: string): Promise<BigDecimal> {
    if (ctx.chainId != VAULT_POOLS["SWELL_L2"].chainId) {
        return new BigDecimal(0)
    }

    if (ctx.blockNumber <= 19617616) {
        return new BigDecimal(0)
    }

    const swellSimpleStakingContract = getSwellSimpleStakingContract(VAULT_POOLS["SWELL_L2"].chainId, VAULT_POOLS["SWELL_L2"].address)
    const stakedBalance = (await swellSimpleStakingContract.stakedBalances(owner, vaultToken, { blockTag: ctx.blockNumber })).scaleDown(18)

    if (!stakedBalance.isZero()) {
        console.log("Got staked balance", stakedBalance)
        ctx.eventLogger.emit("swell_simple_staking_update", {
            account: owner,
            vaultToken: vaultToken,
            stakedBalance: stakedBalance,
            timestampMs: BigInt(ctx.timestamp.getTime())
        })
    }
    return stakedBalance
}

function isVaultPool(address: string): boolean {
    return Object.values(VAULT_POOLS).some(pool => pool.address == address)
}