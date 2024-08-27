import { EthContext } from "@sentio/sdk/eth"
import { LyraVaultTokenPrice } from "../schema/store.js"
import { getLyraVaultTokenContractOnContext } from "../types/eth/lyravaulttoken.js"
import { MILLISECONDS_PER_DAY } from "../config.js"
import { BigDecimal } from "@sentio/sdk"
import { getAddress } from "ethers"

export async function saveCurrentVaultTokenPrice(ctx: EthContext, vaultTokenAddress: string, predepositUpgradeTimestampMs: number | undefined) {
    const nowMs = BigInt(ctx.timestamp.getTime())
    vaultTokenAddress = getAddress(vaultTokenAddress)

    // Skip saving if Pre-Deposit Upgrade not yet enabled
    if (predepositUpgradeTimestampMs && nowMs < BigInt(predepositUpgradeTimestampMs)) {
        // console.log(`Skipping token price save at time ${nowMs} for ${vaultTokenAddress} as it's before pre-deposit upgrade`)
        return
    } else {
        console.log(`${vaultTokenAddress}, ${nowMs}, ${predepositUpgradeTimestampMs}`)
    }

    // This is taken exclusively from the Lyra Chain
    const vaultTokenContract = getLyraVaultTokenContractOnContext(ctx, vaultTokenAddress)
    vaultTokenContract.address = vaultTokenAddress
    try {
        const shareToUnderlying = (await vaultTokenContract.getSharesValue("1000000000000000000")).scaleDown(18)
        console.log(`For ${vaultTokenAddress} got ${shareToUnderlying}`)
        await ctx.store.upsert(new LyraVaultTokenPrice({
            id: `${vaultTokenAddress}-${nowMs}`,
            vaultAddress: vaultTokenAddress,
            timestampMs: nowMs,
            vaultToUnderlying: shareToUnderlying
        }))

        // For 0xec68928bd83B2E52fF5A8e8c215B6ea72879F521 got 1.006266950425962837 (1.6266950425962837)

    } catch (e) {
        console.log(`Error calling getSharesValue for ${vaultTokenAddress} at ${nowMs}: ${e.message}`)
        return
    }
}

export async function toUnderlyingBalance(ctx: EthContext, vaultAddress: string, vaultBalance: BigDecimal, snapshotTimestampMs: bigint): Promise<BigDecimal> {
    vaultAddress = getAddress(vaultAddress)

    // Gets closest vault token price +/- 1 day
    const upperBound = snapshotTimestampMs + BigInt(MILLISECONDS_PER_DAY * 5)
    const lowerBound = snapshotTimestampMs - BigInt(MILLISECONDS_PER_DAY * 5)
    const pricesNearby = await ctx.store.list(LyraVaultTokenPrice, [
        { field: "vaultAddress", op: "=", value: vaultAddress },
        { field: "timestampMs", op: "<", value: upperBound },
        { field: "timestampMs", op: ">", value: lowerBound }
    ])

    console.log(`Looking through prices nearby for vault ${vaultAddress} with length ${pricesNearby.length} at timestamp ${snapshotTimestampMs} with bounds ${lowerBound} and ${upperBound}`)
    let tokenPriceWithinBounds: LyraVaultTokenPrice | undefined = await _find_closest_snapshot(pricesNearby, snapshotTimestampMs)

    // handle the last batch
    if (!tokenPriceWithinBounds) {
        return vaultBalance
    }
    console.log(`Found token price within bounds for vault ${vaultAddress}`)
    return tokenPriceWithinBounds.vaultToUnderlying.multipliedBy(vaultBalance)
}

async function _find_closest_snapshot(pricesNearby: LyraVaultTokenPrice[], snapshotTimestampMs: bigint): Promise<LyraVaultTokenPrice | undefined> {
    let tokenPriceWithinBounds: LyraVaultTokenPrice | undefined;
    let timestampDiff = BigInt(Number.MAX_SAFE_INTEGER)
    for (const tokenPrice of pricesNearby) {
        let diff = snapshotTimestampMs - tokenPrice.timestampMs
        if (diff < 0) diff = -diff

        if (diff < timestampDiff) {
            timestampDiff = diff
            tokenPriceWithinBounds = tokenPrice
        }
    }
    return tokenPriceWithinBounds
}