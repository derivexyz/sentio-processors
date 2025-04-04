import { IntegratorSeason, vaults } from "@derivefinance/derive-sentio-utils";
import { BigDecimal } from "@sentio/sdk";
import { EthChainId } from "@sentio/sdk/eth";

// TODO: Fix exact Integrator Season dates

// Swell WaveDrops: https://app.swellnetwork.io/dao/swell-city
export const INTEGRATOR_SEASONS: IntegratorSeason[] = [
    {
        name: "season_1",
        seasonEndMs: 1728345600000
    },
    {
        name: "season_2",
        seasonEndMs: 1734393600000
    },
    {
        name: "season_3",
        seasonEndMs: 1850000000000 // leaving forever on (2028)
    }
]

export enum VaultName {
    RSWETHC_MAINNET = "RSWETHC_MAINNET"
}

export const ARB_VAULT_PRICE_START_BLOCK = 217000000;
export const MAINNET_VAULT_PRICE_START_BLOCK = 20000000;

export const DERIVE_VAULTS: Record<VaultName, vaults.VaultConfig> = {
    RSWETHC_MAINNET: {
        vaultName: VaultName.RSWETHC_MAINNET,
        subaccountId: BigInt(5739),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0xE9A12fB15cC00b59867E4E2f0aCbdCebfd32b3d7",
        derive: "0x5bbef94dcee8f087D5146d2815bC4955C76B2794",
        predepositUpgradeTimestampMs: 1720252800000,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "swell": 18, // 4.5x * 4 pearls per ETH per day
            "eigenlayer": 21,
        }
    }
}

export enum V2AssetName {
    RSWETH = "RSWETH",
}


export const VAULT_POOLS: Record<string, vaults.VaultPoolConfig> = {
    SWELL_L2: {
        chainId: EthChainId.ETHEREUM,
        address: "0x38D43a6Cb8DA0E855A42fB6b0733A0498531d774",
        name: "SWELL_L2"
    }
}

export const V2_ASSETS: Record<V2AssetName, vaults.V2AssetConfig> = {
    RSWETH: {
        assetAndSubId: "0xef2fc00b7f7c71c73a68dad25c9d673b2e1983ba000000000000000000000000", // asset: 0xef2Fc00B7F7c71c73a68dAD25c9D673b2e1983ba
        assetName: "RSWETH",
        assetAddress: "0xef2Fc00B7F7c71c73a68dAD25c9D673b2e1983ba",
        subId: BigInt(0),
        pointMultipliersPerDay: {
            swell: 18,
            eigenlayer: 21
        }
    }
}

export const DERIVE_V2_DEPOSIT_START_BLOCK = 10000000; // July 3rd

// exclude all subaccounts in the vault configs
export const excludedSubaccounts = [...new Set(Object.values(DERIVE_VAULTS).map(config => config.subaccountId))];

export type PointUpdateEvent = {
    account: string;
    assetAndSubIdOrVaultAddress: string;
    assetName: string;

    // earned points
    earnedSwellPoints: number
    earnedEigenlayerPoints: number;
    // last snapshot
    lastTimestampMs: bigint;
    lastBalance: BigDecimal;
    lastEffectiveBalance: BigDecimal;
    // new snapshot
    newTimestampMs: bigint;
    newBalance: BigDecimal;
    newEffectiveBalance: BigDecimal;

    // season
    season: string;

}