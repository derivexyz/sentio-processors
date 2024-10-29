import { EthContext } from "@sentio/sdk/eth";
import { INTEGRATOR_SEASONS, PointUpdateEvent } from "../config.js";
import { getCurrentSeason, schemas, vaults } from "@derivefinance/derive-sentio-utils";
import { MILLISECONDS_PER_DAY } from "@derivefinance/derive-sentio-utils/dist/constants.js";

export function emitVaultUserPoints(ctx: EthContext, vaultConfig: vaults.VaultConfig, lastSnapshot: schemas.DeriveVaultUserSnapshot | undefined, newSnapshot: schemas.DeriveVaultUserSnapshot | undefined) {
    if (!lastSnapshot || !newSnapshot) return;

    if (lastSnapshot.vaultBalance.isZero()) return;

    const elapsedDays = (Number(newSnapshot.timestampMs) - Number(lastSnapshot.timestampMs)) / MILLISECONDS_PER_DAY
    const earnedEthenaPoints = elapsedDays * vaultConfig.pointMultipliersPerDay["ethena"] * lastSnapshot.underlyingEffectiveBalance.toNumber()

    const data: PointUpdateEvent = {
        account: lastSnapshot.owner,
        assetAndSubIdOrVaultAddress: lastSnapshot.vaultAddress,
        assetName: vaultConfig.vaultName,

        // earned points
        earnedEthenaPoints: earnedEthenaPoints,

        // last snapshot
        lastTimestampMs: lastSnapshot.timestampMs,
        lastBalance: lastSnapshot.vaultBalance,
        lastEffectiveBalance: lastSnapshot.underlyingEffectiveBalance,

        // new snapshot
        newTimestampMs: newSnapshot.timestampMs,
        newBalance: newSnapshot.vaultBalance,
        newEffectiveBalance: newSnapshot.underlyingEffectiveBalance,

        // season
        season: getCurrentSeason(INTEGRATOR_SEASONS, newSnapshot.timestampMs)
    }

    ctx.eventLogger.emit("point_update", data);
}