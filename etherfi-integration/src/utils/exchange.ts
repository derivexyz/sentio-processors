import axios from "axios"
import { EthContext, isNullAddress } from "@sentio/sdk/eth";
import { DeriveExchangeUserSnapshot } from "../schema/store.js";
import { MILLISECONDS_PER_DAY, V2_ASSETS } from "../config.js";
import { v2, V2AssetConfig } from "@derivefinance/derive-sentio-utils"

export async function updateUserExchangeSnapshotAndEmitPoints(ctx: EthContext, assetName: keyof typeof V2_ASSETS) {

    // make axios post request
    const balances: v2.V2EOABalance[] = await v2.getBalances(V2_ASSETS[assetName].assetName, V2_ASSETS[assetName].assetAndSubId, BigInt(ctx.timestamp.getTime()));

    for (const new_balance of balances) {
        let lastSnapshot = await ctx.store.get(DeriveExchangeUserSnapshot, new_balance.id)

        if (lastSnapshot) {
            // deep clone to avoid mutation
            lastSnapshot = new DeriveExchangeUserSnapshot({
                id: lastSnapshot.id,
                eoa: lastSnapshot.eoa,
                tokenName: lastSnapshot.tokenName,
                amount: lastSnapshot.amount
            })
        }

        const new_snapshot = new DeriveExchangeUserSnapshot({ ...new_balance })
        await ctx.store.upsert(new_snapshot)

        await emitExchangePoints(ctx, V2_ASSETS[assetName], lastSnapshot, new_snapshot)
    }
}


async function emitExchangePoints(ctx: EthContext, v2AssetConfig: V2AssetConfig, lastSnapshot: DeriveExchangeUserSnapshot | undefined, newSnapshot: DeriveExchangeUserSnapshot) {
    if (!lastSnapshot || !newSnapshot) return;

    const elapsedDays = (Number(newSnapshot.timestampMs) - Number(lastSnapshot.timestampMs)) / MILLISECONDS_PER_DAY

    // Emit points update
    ctx.eventLogger.emit("point_update", {
        account: lastSnapshot.eoa,
        assetAndSubIdOrVaultAddress: lastSnapshot.id,
        assetName: v2AssetConfig.assetName,
        earnedEtherfiPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["etherfi"] * lastSnapshot.amount.toNumber(),
        earnedEigenlayerPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["eigenlayer"] * lastSnapshot.amount.toNumber(),
        earnedLombardPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["lombard"] * lastSnapshot.amount.toNumber(),
        earnedBabylonPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["babylon"] * lastSnapshot.amount.toNumber(),

        // last snapshot
        lastTimestampMs: lastSnapshot.timestampMs,
        lastBalance: lastSnapshot.amount,
        lastEffectiveBalance: lastSnapshot.amount, // same in the case of exchanges
        // new snapshot
        newTimestampMs: newSnapshot.timestampMs,
        newBalance: newSnapshot.amount,
        newEffectiveBalance: newSnapshot.amount,  // same in the case of exchanges
    });


}
