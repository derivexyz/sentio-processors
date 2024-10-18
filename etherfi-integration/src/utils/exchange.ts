import axios from "axios"
import { EthChainId, EthContext, getProvider, isNullAddress } from "@sentio/sdk/eth";
import { DeriveExchangeUserSnapshot, Subaccount } from "../schema/store.js";
import { DERIVE_V2_MATCHING_ADDRESS, LYRA_VAULTS, MILLISECONDS_PER_DAY, PointUpdateEvent, V2_ASSETS } from "../config.js";
import { isVaultSubaccount, V2AssetConfig } from "@derivefinance/derive-sentio-utils"
import { getMatchingContract } from "../types/eth/matching.js";
import { getLightAccountContract } from "../types/eth/lightaccount.js";
import { BigDecimal } from "@sentio/sdk";


export async function updateExchangeBalance(ctx: EthContext, assetName: keyof typeof V2_ASSETS, subaccountId: bigint, newBalance: BigDecimal) {
    const eoa = await getEOA(ctx, subaccountId)

    if (!eoa) {
        return
    }
    const assetAndSubId = V2_ASSETS[assetName].assetAndSubId

    const [totalBalance, lastTimestampMs, newTimestampMs] = await getTotalSubaccountBalances(ctx, assetAndSubId, eoa)


    let lastSubaccountBalance = new BigDecimal(0)
    const lastSnapshot = await ctx.store.get(DeriveExchangeUserSnapshot, `${subaccountId}-${assetAndSubId}`)
    if (lastSnapshot) {
        lastSubaccountBalance = lastSnapshot.amount
    }

    const new_snapshot = new DeriveExchangeUserSnapshot({
        id: `${subaccountId}-${assetAndSubId}`,
        assetAndSubId: assetAndSubId,
        subaccountId: subaccountId,
        eoa: eoa,
        tokenName: V2_ASSETS[assetName].assetName,
        amount: newBalance, // also what about zeros...
        timestampMs: newTimestampMs
    })
    await ctx.store.upsert(new_snapshot)

    await emitUserExchangePoints(ctx, V2_ASSETS[assetName], eoa, lastTimestampMs, newTimestampMs, totalBalance, totalBalance.minus(lastSubaccountBalance).plus(newBalance))
}


export async function updateExchangeTimestamp(ctx: EthContext) {
    const userSnapshots: DeriveExchangeUserSnapshot[] = await ctx.store.list(DeriveExchangeUserSnapshot, []);

    try {
        const promises = [];
        const usersToUpdate = getUsersToUpdate(userSnapshots);
        console.log(`Found ${usersToUpdate.length} users to update exchange points`)
        for (const [eoa, assetAndSubId, tokenName] of usersToUpdate) {
            promises.push((async () => {
                console.log(`Calculating total subaccount balances for ${eoa} ${tokenName} ${assetAndSubId}`)
                const [totalBalance, lastTimestampMs, newTimestampMs] = await getTotalSubaccountBalances(ctx, assetAndSubId, eoa)
                console.log(`Updating exchange points for ${eoa} ${tokenName} ${totalBalance} ${lastTimestampMs} ${newTimestampMs}`)
                await emitUserExchangePoints(ctx, V2_ASSETS[tokenName], eoa, lastTimestampMs, newTimestampMs, totalBalance, totalBalance)
            })());
        }
        await Promise.all(promises);
    } catch (e) {
        console.log("onTimeInterval when updating exchange timestamp", e.message, e.data);
    }
}


async function emitUserExchangePoints(ctx: EthContext, v2AssetConfig: V2AssetConfig, eoa: string, lastTimestampMs: bigint | undefined, newTimestampMs: bigint, lastBalance: BigDecimal, newBalance: BigDecimal) {
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

function getUsersToUpdate(allExchangeSnapshots: DeriveExchangeUserSnapshot[]): [string, string, string][] {
    const usersToUpdate = new Set<[string, string, string]>()
    for (const snapshot of allExchangeSnapshots) {
        usersToUpdate.add([snapshot.eoa, snapshot.assetAndSubId, snapshot.tokenName])
    }

    return Array.from(usersToUpdate)
}

async function getTotalSubaccountBalances(ctx: EthContext, assetAndSubId: string, eoa: string): Promise<[BigDecimal, bigint | undefined, bigint]> {
    const allSubaccountSnapshots = await ctx.store.list(DeriveExchangeUserSnapshot, [
        { field: "eoa", op: "=", value: eoa },
        { field: "assetAndSubId", op: "=", value: assetAndSubId }
    ])

    let totalBalance = new BigDecimal(0)
    let lastTimestampMs = undefined
    const newTimestampMs = BigInt(ctx.timestamp.getTime())
    for (const snapshot of allSubaccountSnapshots) {
        totalBalance = totalBalance.plus(snapshot.amount)

        if (!lastTimestampMs) {
            lastTimestampMs = snapshot.timestampMs
        } else {
            if (snapshot.timestampMs != lastTimestampMs) {
                throw new Error(`Snapshots for EOA ${eoa} have different timestamps`)
            }
        }


        snapshot.timestampMs = newTimestampMs
        await ctx.store.upsert(snapshot)
    }

    return [totalBalance, lastTimestampMs, newTimestampMs]
}

async function getEOA(ctx: EthContext, subaccountId: bigint): Promise<string | undefined> {
    if (subaccountId < 2) {
        throw new Error("Subaccount id must be greater than 1")
    }

    const subaccount = await ctx.store.get(Subaccount, `${subaccountId}`)
    if (!subaccount) {
        const owner = await getSubaccountOwnerFromMatching(ctx, subaccountId)
        const subaccount = await getSubaccountDetails(ctx, owner, subaccountId)
        await ctx.store.upsert(subaccount);
        return subaccount.eoa;
    }

    return subaccount.eoa;

}

// listen on matching event
async function getSubaccountDetails(ctx: EthContext, owner: string | undefined, subaccountId: bigint): Promise<Subaccount> {

    if (owner) {
        const eoa = await getSmartContractOwner(owner)
        return new Subaccount({
            id: `${subaccountId}`,
            subaccountId: subaccountId,
            eoa: eoa ? eoa : owner,
            // set to undefined if eoa is none
            smartContractWallet: eoa ? owner : undefined,
        })
    } else { // not in matching contract
        return new Subaccount({
            id: `${subaccountId}`,
            subaccountId: subaccountId,
            eoa: undefined,
            smartContractWallet: undefined,
        })
    }
}


async function getSubaccountOwnerFromMatching(ctx: EthContext, subaccountId: bigint): Promise<string | undefined> {
    if (isVaultSubaccount(subaccountId, Object.values(LYRA_VAULTS))) {
        return undefined
    }

    const matchingContract = getMatchingContract(EthChainId.LYRA, DERIVE_V2_MATCHING_ADDRESS)
    const owner = await matchingContract.subAccountToOwner(subaccountId)

    if (isNullAddress(owner)) {
        return undefined
    }

    return owner;
}

async function getSmartContractOwner(subaccountOwner: string): Promise<string | undefined> {

    if (await getProvider(EthChainId.LYRA).getCode(subaccountOwner) === "0x") {
        return undefined;
    }

    const subaccountOwnerContract = getLightAccountContract(EthChainId.LYRA, subaccountOwner)
    return await subaccountOwnerContract.owner()
}
