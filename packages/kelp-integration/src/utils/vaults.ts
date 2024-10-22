import { EthContext } from "@sentio/sdk/eth";
import { PointUpdateEvent } from "../config.js";
import { schemas, vaults } from "@derivefinance/derive-sentio-utils";
import { MILLISECONDS_PER_DAY } from "@derivefinance/derive-sentio-utils/dist/constants.js";

export function emitVaultUserPoints(ctx: EthContext, vaultConfig: vaults.VaultConfig, lastSnapshot: schemas.DeriveVaultUserSnapshot | undefined, newSnapshot: schemas.DeriveVaultUserSnapshot | undefined) {
    if (!lastSnapshot || !newSnapshot) return;

    if (lastSnapshot.vaultBalance.isZero()) return;

    const elapsedDays = (Number(newSnapshot.timestampMs) - Number(lastSnapshot.timestampMs)) / MILLISECONDS_PER_DAY
    const earnedKelpPoints = elapsedDays * vaultConfig.pointMultipliersPerDay["kelp"] * lastSnapshot.underlyingEffectiveBalance.toNumber()
    const earnedEigenlayerPoints = elapsedDays * vaultConfig.pointMultipliersPerDay["eigenlayer"] * lastSnapshot.underlyingEffectiveBalance.toNumber()

    const data: PointUpdateEvent = {
        account: lastSnapshot.owner,
        assetAndSubIdOrVaultAddress: lastSnapshot.vaultAddress,
        assetName: vaultConfig.vaultName,

        // earned points
        earnedKelpPoints: earnedKelpPoints,
        earnedEigenlayerPoints: earnedEigenlayerPoints,

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