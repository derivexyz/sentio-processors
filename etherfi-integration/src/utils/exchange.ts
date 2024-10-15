import axios from "axios"
import { EthContext, isNullAddress } from "@sentio/sdk/eth";
import { BigDecimal } from "@sentio/sdk";
import { DeriveExchangeUserSnapshot } from "../schema/store.js";
import { MILLISECONDS_PER_DAY, V2_ASSETS, V2AssetConfig } from "../config.js";

export async function updateUserExchangeSnapshotAndEmitPoints(ctx: EthContext, assetName: keyof typeof V2_ASSETS) {

    // make axios post request
    const balances = await getBalances(ctx, V2_ASSETS[assetName].assetName, V2_ASSETS[assetName].assetAndSubId);

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

        await ctx.store.upsert(new_balance)

        await emitExchangePoints(ctx, V2_ASSETS[assetName], lastSnapshot, new_balance)
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
        earnedEtherfiPoints: elapsedDays * v2AssetConfig.etherfiPointsPerDay * lastSnapshot.amount.toNumber(),
        earnedEigenlayerPoints: 0,
        earnedLombardPoints: elapsedDays * v2AssetConfig.lombardPointPerDay * lastSnapshot.amount.toNumber(),
        earnedBabylonPoints: elapsedDays * v2AssetConfig.babylonPointsPerDay * lastSnapshot.amount.toNumber(),

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

export async function getBalances(ctx: EthContext, v2AssetName: string, assetAndSubId: string): Promise<DeriveExchangeUserSnapshot[]> {
    let currentTimestampMs = BigInt(ctx.timestamp.getTime())

    const query = `
        {
            subAccountBalances(
                where: {asset: "0x0000000000000000000000002bf0d5d2ca86584bc4cfb6fac7ad09d4143eb057", balance_gt: 0}
            ) {
                subaccount {
                    matchingOwner {
                        id
                        owner
                    }
                }
                balance
            }
        }`;
    const result = await queryV2Subgraph(query)

    if (!result || !result.data.subAccountBalances) {
        console.log("No data found in subgraph for assetAndSubId: ", assetAndSubId);
        return [];
    }

    // Create a map of merged balances by smartContractOwner
    const combinedBalances = result.data.subAccountBalances
        .filter((item: SubAccountBalance) => item.subaccount.matchingOwner !== null) // Filter out null matchingOwner
        .reduce((acc: Map<string, BigDecimal>, item: SubAccountBalance) => {
            const owner = item.subaccount.matchingOwner!.id;
            const eoa = item.subaccount.matchingOwner!.owner || owner; // If not SCW, the owner is an EOA
            const balance = new BigDecimal(item.balance);

            acc.set(eoa, (acc.get(eoa) || new BigDecimal(0)).plus(balance));
            return acc;
        }, new Map<string, BigDecimal>());

    // Convert the merged balances into DeriveExchangeUserSnapshot array
    return Array.from(combinedBalances.entries()).map(([eoa, balance]) => (
        new DeriveExchangeUserSnapshot({
            id: `${eoa}-${assetAndSubId}`,
            eoa: eoa,
            tokenName: v2AssetName,
            amount: balance,
            timestampMs: currentTimestampMs
        })
    ));
}

export async function queryV2Subgraph(graphQLQuery: string) {
    const options = {
        method: 'POST',
        url: 'https://app.sentio.xyz/api/v1/analytics/derive/v2_subgraph/sql/execute',
        headers: {
            'api-key': process.env.V2_SUBGRAPH_API_KEY,
            'Content-Type': 'application/json'
        },
        data: {
            query: graphQLQuery,
        }
    };

    return axios.request(options)
        .then(response => {
            console.log(response.data);
            return response.data;
        })
        .catch(error => {
            console.error(error);
        });
}

interface MatchingOwner {
    id: string;
    owner: string | null;
}

interface SubAccount {
    matchingOwner: MatchingOwner | null;
}

interface SubAccountBalance {
    balance: string;
    subaccount: SubAccount;
}