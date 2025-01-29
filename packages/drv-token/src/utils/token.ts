import { EthContext, isNullAddress } from "@sentio/sdk/eth";
import { TokenPeriodicUpdate } from "../config.js";
import { schemas, vaults } from "@derivefinance/derive-sentio-utils";
import { erc20 } from "@sentio/sdk/eth/builtin";
import { getAddress } from "ethers";

export async function updateTokenUserSnapshot(ctx: EthContext, vaultConfig: vaults.VaultConfig, tokenAddress: string, owner: string, excludedOwners: string[]): Promise<[schemas.DeruveTokenUserSnapshot?, schemas.DeruveTokenUserSnapshot?]> {
    tokenAddress = getAddress(tokenAddress)

    if (isNullAddress(owner) || excludedOwners.includes(owner)) return [undefined, undefined];

    const vaultTokenContractView = erc20.getERC20ContractOnContext(ctx, tokenAddress)
    let currentTimestampMs = BigInt(ctx.timestamp.getTime())
    let balance = (await vaultTokenContractView.balanceOf(owner)).scaleDown(vaultConfig.vaultDecimals)

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
            tokenName: vaultConfig.tokenName,
            tokenAddress: tokenAddress,
            timestampMs: currentTimestampMs,
            balance: balance,
        }
    )

    await ctx.store.upsert(newSnapshot)

    return [lastSnapshot, newSnapshot]
}

export function emitVaultUserPoints(ctx: EthContext, vaultConfig: vaults.VaultConfig, lastSnapshot: schemas.DeriveVaultUserSnapshot | undefined, newSnapshot: schemas.DeriveVaultUserSnapshot | undefined) {
    if (!lastSnapshot || !newSnapshot) return;

    if (lastSnapshot.vaultBalance.isZero()) return;

    const data: TokenPeriodicUpdate = {
        account: lastSnapshot.owner,
        assetAndSubIdOrVaultAddress: lastSnapshot.vaultAddress,
        assetName: vaultConfig.vaultName,

        // last snapshot
        lastTimestampMs: lastSnapshot.timestampMs,
        lastBalance: lastSnapshot.vaultBalance,

        // new snapshot
        newTimestampMs: newSnapshot.timestampMs,
        newBalance: newSnapshot.vaultBalance,
    }

    ctx.eventLogger.emit("token_update", data);
}