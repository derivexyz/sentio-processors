import { EthContext } from "@sentio/sdk/eth";
import { PointUpdateEvent } from "../config.js";
import { schemas, vaults } from "@derivefinance/derive-sentio-utils";
import { MILLISECONDS_PER_DAY } from "@derivefinance/derive-sentio-utils/dist/constants.js";

export function emitVaultUserPoints(ctx: EthContext, vaultConfig: vaults.VaultConfig, lastSnapshot: schemas.DeriveVaultUserSnapshot | undefined, newSnapshot: schemas.DeriveVaultUserSnapshot | undefined) {
    if (!lastSnapshot || !newSnapshot) return;

    if (lastSnapshot.vaultBalance.isZero()) return;

    const elapsedDays = (Number(newSnapshot.timestampMs) - Number(lastSnapshot.timestampMs)) / MILLISECONDS_PER_DAY

    // NOTE: on December 12 11am AEST, got boost to 4x (40,000) - end is TBD
    // 1733962000

    let etherfiPointsPerDay;
    if (ctx.timestamp.getTime() < 1733962000000) { // and another && when end date specified
        etherfiPointsPerDay = vaultConfig.pointMultipliersPerDay["etherfi"]
    } else {
        etherfiPointsPerDay = 40000
    }


    const earnedEtherfiPoints = elapsedDays * etherfiPointsPerDay * lastSnapshot.underlyingEffectiveBalance.toNumber()
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