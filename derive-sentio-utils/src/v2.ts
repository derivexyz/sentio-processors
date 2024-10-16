import { BigDecimal } from "@sentio/sdk";
import axios from "axios";

export async function getBalances(v2AssetName: string, assetAndSubId: string, currentTimestampMs: bigint): Promise<V2EOABalance[]> {
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
        {
            id: `${eoa}-${assetAndSubId}`,
            eoa: eoa,
            tokenName: v2AssetName,
            amount: balance,
            timestampMs: currentTimestampMs
        })
    );
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

export type V2EOABalance = {
    id: string, // `${eoa}-${assetAndSubId}`
    eoa: string,
    tokenName: string,
    amount: BigDecimal,
    timestampMs: bigint
}