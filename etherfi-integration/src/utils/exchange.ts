import { EthChainId, EthContext, getProvider, isNullAddress } from "@sentio/sdk/eth";
import { DERIVE_VAULTS, PointUpdateEvent, V2_ASSETS } from "../config.js";
import { BigDecimal } from "@sentio/sdk";
import { schemas, v2, vaults } from "@derivefinance/derive-sentio-utils";
import { MILLISECONDS_PER_DAY } from "@derivefinance/derive-sentio-utils/dist/constants.js";


export async function emitUserExchangePoints(ctx: EthContext, v2AssetConfig: vaults.V2AssetConfig, eoa: string, lastTimestampMs: bigint | undefined, newTimestampMs: bigint, lastBalance: BigDecimal, newBalance: BigDecimal) {
    let elapsedDays = 0
    if (lastTimestampMs) {
        elapsedDays = (Number(newTimestampMs) - Number(lastTimestampMs)) / MILLISECONDS_PER_DAY
    }

    // Emit points update
    const data: PointUpdateEvent = {
        account: eoa,
        assetAndSubIdOrVaultAddress: v2AssetConfig.assetAndSubId,
        assetName: v2AssetConfig.assetName,
        earnedEtherfiPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["etherfi"] * lastBalance.toNumber(),
        earnedEigenlayerPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["eigenlayer"] * lastBalance.toNumber(),
        earnedLombardPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["lombard"] * lastBalance.toNumber(),
        earnedBabylonPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["babylon"] * lastBalance.toNumber(),

        // last snapshot
        lastTimestampMs: lastTimestampMs ? lastTimestampMs : BigInt(0),
        lastBalance: lastTimestampMs ? lastBalance : BigDecimal(0),
        lastEffectiveBalance: lastTimestampMs ? lastBalance : BigDecimal(0), // same in the case of exchanges
        // new snapshot
        newTimestampMs: newTimestampMs,
        newBalance: newBalance,
        newEffectiveBalance: newBalance,  // same in the case of exchanges
    }
    ctx.eventLogger.emit("point_update", data);
}
