import { EthChainId, EthContext, getProvider, isNullAddress } from "@sentio/sdk/eth";
import { INTEGRATOR_SEASONS, TokenPeriodicUpdate, V2_ASSETS } from "../config.js";
import { BigDecimal } from "@sentio/sdk";
import { getCurrentSeason, schemas, v2, vaults } from "@derivefinance/derive-sentio-utils";
import { MILLISECONDS_PER_DAY } from "@derivefinance/derive-sentio-utils/dist/constants.js";


// export async function emitUserExchangePoints(ctx: EthContext, v2AssetConfig: vaults.V2AssetConfig, eoa: string, lastTimestampMs: bigint | undefined, newTimestampMs: bigint, lastBalance: BigDecimal, newBalance: BigDecimal) {
//     let elapsedDays = 0
//     if (lastTimestampMs) {
//         elapsedDays = (Number(newTimestampMs) - Number(lastTimestampMs)) / MILLISECONDS_PER_DAY
//     }

//     // Emit points update
//     const data: TokenPeriodicUpdate = {
//         account: eoa,
//         assetAndSubIdOrVaultAddress: v2AssetConfig.assetAndSubId,
//         assetName: v2AssetConfig.assetName,
//         earnedEthenaPoints: elapsedDays * v2AssetConfig.pointMultipliersPerDay["ethena"] * lastBalance.toNumber(),

//         // last snapshot
//         lastTimestampMs: lastTimestampMs ? lastTimestampMs : BigInt(0),
//         lastBalance: lastTimestampMs ? lastBalance : BigDecimal(0),
//         lastEffectiveBalance: lastTimestampMs ? lastBalance : BigDecimal(0), // same in the case of exchanges
//         // new snapshot
//         newTimestampMs: newTimestampMs,
//         newBalance: newBalance,
//         newEffectiveBalance: newBalance,  // same in the case of exchanges

//         // season
//         season: getCurrentSeason(INTEGRATOR_SEASONS, newTimestampMs)
//     }
//     ctx.eventLogger.emit("point_update", data);
// }
