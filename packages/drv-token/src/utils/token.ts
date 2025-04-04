import { EthContext, isNullAddress } from "@sentio/sdk/eth";
import { TokenConfig, TokenPeriodicUpdate } from "../config.js";
import { schemas, vaults } from "@derivefinance/derive-sentio-utils";
import { erc20 } from "@sentio/sdk/eth/builtin";
import { getAddress } from "ethers";
import { BigDecimal } from "@sentio/sdk";

export async function updateTokenUserSnapshot(ctx: EthContext, tokenConfig: TokenConfig, tokenAddress: string, owner: string, excludedOwners: string[]): Promise<[schemas.DeriveTokenUserSnapshot?, schemas.DeriveTokenUserSnapshot?]> {
    tokenAddress = getAddress(tokenAddress)

    if (isNullAddress(owner) || excludedOwners.includes(owner)) return [undefined, undefined];

    const vaultTokenContractView = erc20.getERC20ContractOnContext(ctx, tokenAddress)
    let currentTimestampMs = BigInt(ctx.timestamp.getTime())
    let balance = (await vaultTokenContractView.balanceOf(owner)).scaleDown(tokenConfig.decimals)

    let lastSnapshot = await ctx.store.get(schemas.DeriveTokenUserSnapshot, `${owner}-${tokenAddress}`)

    if (lastSnapshot) {
        // deep clone to avoid mutation
        lastSnapshot = new schemas.DeriveTokenUserSnapshot({
            id: lastSnapshot.id,
            owner: lastSnapshot.owner,
            tokenName: lastSnapshot.tokenName,
            tokenAddress: lastSnapshot.tokenAddress,
            timestampMs: lastSnapshot.timestampMs,
            balance: lastSnapshot.balance,
        })
    }

    let newSnapshot = new schemas.DeriveTokenUserSnapshot(
        {
            id: `${owner}-${tokenAddress}`,
            owner: owner,
            tokenName: tokenConfig.tokenName,
            tokenAddress: tokenAddress,
            timestampMs: currentTimestampMs,
            balance: balance,
        }
    )

    await ctx.store.upsert(newSnapshot)

    return [lastSnapshot, newSnapshot]
}

export function emitTokenUpdate(ctx: EthContext, tokenConfig: TokenConfig, lastSnapshot: schemas.DeriveTokenUserSnapshot | undefined, newSnapshot: schemas.DeriveTokenUserSnapshot | undefined) {
    let data: TokenPeriodicUpdate;

    // usually if first time minted, the sender will be null address and snapshot will be null
    if (!newSnapshot) return;

    // usually if first time minted, the receiver will not have last snapshot
    if (!lastSnapshot) {
        data = {
            account: newSnapshot.owner,
            assetAndSubIdOrVaultAddress: newSnapshot.tokenAddress,
            assetName: tokenConfig.tokenName,

            // last snapshot
            lastTimestampMs: BigInt(0),
            lastBalance: BigDecimal(0),

            // new snapshot
            newTimestampMs: newSnapshot.timestampMs,
            newBalance: newSnapshot.balance,
        }
    } else {
        if (lastSnapshot.balance === newSnapshot.balance) return;

        data = {
            account: lastSnapshot.owner,
            assetAndSubIdOrVaultAddress: lastSnapshot.tokenAddress,
            assetName: tokenConfig.tokenName,

            // last snapshot
            lastTimestampMs: lastSnapshot.timestampMs,
            lastBalance: lastSnapshot.balance,

            // new snapshot
            newTimestampMs: newSnapshot.timestampMs,
            newBalance: newSnapshot.balance,
        }

    }
    ctx.eventLogger.emit("token_update", data);


}