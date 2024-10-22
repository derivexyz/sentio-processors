import { EthChainId, EthContext, isNullAddress } from "@sentio/sdk/eth";
import { erc20 } from "@sentio/sdk/eth/builtin";
import { DeriveVaultUserSnapshot } from "../schema/store.js";
import { DERIVE_VAULTS, MILLISECONDS_PER_DAY, SEASONS } from "../config.js";
import { toUnderlyingBalance } from "./vaultTokenPrice.js";
import { getAddress } from "ethers";
import { getCurrentSeason, VaultConfig } from "@derivefinance/derive-sentio-utils";

export async function updateUserSnapshotAndEmitPointUpdate(ctx: EthContext, vaultName: keyof typeof DERIVE_VAULTS, vaultTokenAddress: string, owner: string) {
    let [oldSnapshot, newSnapshot] = await updateDeriveVaultUserSnapshot(ctx, vaultName, vaultTokenAddress, owner)
    emitUserPointUpdate(ctx, DERIVE_VAULTS[vaultName], oldSnapshot, newSnapshot)
}

export async function updateDeriveVaultUserSnapshot(ctx: EthContext, vaultName: keyof typeof DERIVE_VAULTS, vaultTokenAddress: string, owner: string): Promise<[DeriveVaultUserSnapshot?, DeriveVaultUserSnapshot?]> {
    vaultTokenAddress = getAddress(vaultTokenAddress)

    if (isNullAddress(owner)) return [undefined, undefined];

    const vaultTokenContractView = erc20.getERC20ContractOnContext(ctx, vaultTokenAddress)
    let currentTimestampMs = BigInt(ctx.timestamp.getTime())
    let currentShareBalance = (await vaultTokenContractView.balanceOf(owner)).scaleDown(DERIVE_VAULTS[vaultName].vaultDecimals)
    let [underlyingBalance, _] = await toUnderlyingBalance(ctx, DERIVE_VAULTS[vaultName].derive, currentShareBalance, currentTimestampMs)

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
            underlyingEffectiveBalance: lastSnapshot.underlyingEffectiveBalance,
        })
    }

    let newSnapshot = new DeriveVaultUserSnapshot(
        {
            id: `${owner}-${vaultTokenAddress}`,
            owner: owner,
            vaultName: vaultName.toString(),
            vaultAddress: vaultTokenAddress,
            timestampMs: currentTimestampMs,
            vaultBalance: currentShareBalance,
            underlyingEffectiveBalance: underlyingBalance,
        }
    )

    await ctx.store.upsert(newSnapshot)

    return [lastSnapshot, newSnapshot]
}

export function emitUserPointUpdate(ctx: EthContext, vaultConfig: VaultConfig, lastSnapshot: DeriveVaultUserSnapshot | undefined, newSnapshot: DeriveVaultUserSnapshot | undefined) {
    if (!lastSnapshot || !newSnapshot) return;

    if (lastSnapshot.vaultBalance.isZero()) return;

    const elapsedDays = (Number(newSnapshot.timestampMs) - Number(lastSnapshot.timestampMs)) / MILLISECONDS_PER_DAY
    const earnedLombardPoints = elapsedDays * vaultConfig.pointMultipliersPerDay["lombard"] * lastSnapshot.underlyingEffectiveBalance.toNumber()
    const earnedBabylonPoints = elapsedDays * vaultConfig.pointMultipliersPerDay["babylon"] * lastSnapshot.underlyingEffectiveBalance.toNumber()
    ctx.eventLogger.emit("point_update", {
        account: lastSnapshot.owner,
        vaultAddress: lastSnapshot.vaultAddress,
        earnedLombardPoints: earnedLombardPoints,
        earnedBabylonPoints: earnedBabylonPoints,
        // last snapshot
        lastTimestampMs: lastSnapshot.timestampMs,
        lastVaultBalance: lastSnapshot.vaultBalance,
        lastUnderlyingEffectiveBalance: lastSnapshot.underlyingEffectiveBalance,
        // new snapshot
        newTimestampMs: newSnapshot.timestampMs,
        newVaultBalance: newSnapshot.vaultBalance,
        newUnderlyingEffectiveBalance: newSnapshot.underlyingEffectiveBalance,
        // testnet vs prod
        is_mainnet: ctx.chainId === EthChainId.ETHEREUM,
        // season
        season: getCurrentSeason(SEASONS, BigInt(ctx.timestamp.getTime()))
    });
}