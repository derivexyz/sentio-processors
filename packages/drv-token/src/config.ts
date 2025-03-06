import { IntegratorSeason, vaults } from "@derivefinance/derive-sentio-utils";
import { BigDecimal } from "@sentio/sdk";
import { EthChainId } from "@sentio/sdk/eth";

// TODO: Fix exact Integrator Season dates


export enum TokenName {
    STDRV_DERIVE = "STDRV_DERIVE",

}

export const DERIVE_CHAIN_STDRV_START_BLOCK = 16026136; // December 2024

export type TokenConfig = {
    tokenName: TokenName;
    destinationChainId: EthChainId;
    destinationChainAddress: string;
    deriveChainAddress: string;
    decimals: number;
    startBlock: number;
}

export const DERIVE_TOKENS: Record<TokenName, TokenConfig> = {
    STDRV_DERIVE: {
        tokenName: TokenName.STDRV_DERIVE,
        destinationChainId: EthChainId.DERIVE,
        destinationChainAddress: "0x7499d654422023a407d92e1D83D387d81BC68De1",
        deriveChainAddress: "0x7499d654422023a407d92e1D83D387d81BC68De1",
        startBlock: DERIVE_CHAIN_STDRV_START_BLOCK,
        decimals: 18,
    }
}

export enum V2AssetName {
    DRV = "DRV",
}

export type V2AssetConfig = {
    assetAndSubId: string;
    assetName: string;
}

// Can later use if tracking exchange balances
export const V2_ASSETS: Record<V2AssetName, V2AssetConfig> = {
    DRV: {
        assetAndSubId: "0x1abdb2896e57047fd989af7b3ee6b7e81830f8d2000000000000000000000000", // asset: 0x1Abdb2896e57047fD989af7B3Ee6B7e81830F8D2
        assetName: "DRV",
    }
}

export const DERIVE_V2_DEPOSIT_START_BLOCK = 19082400; // Jan 29, 2025

// specifically exclude certain subaccounts
export const excludedSubaccounts = [];

export type TokenPeriodicUpdate = {
    account: string;
    assetAndSubIdOrVaultAddress: string;
    assetName: string;

    // last snapshot
    lastTimestampMs: bigint;
    lastBalance: BigDecimal;

    // new snapshot
    newTimestampMs: bigint;
    newBalance: BigDecimal;
}