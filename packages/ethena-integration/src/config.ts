import { IntegratorSeason, vaults } from "@derivefinance/derive-sentio-utils";
import { BigDecimal } from "@sentio/sdk";
import { EthChainId } from "@sentio/sdk/eth";

// TODO: Fix exact Integrator Season dates

// Swell WaveDrops: https://app.swellnetwork.io/dao/swell-city
export const INTEGRATOR_SEASONS: IntegratorSeason[] = [
    {
        name: "season_1",
        seasonEndMs: 1711929600000 //  Apr 1, 2024
    },
    {
        name: "season_2",
        seasonEndMs: 1725235200000 // Sep 2nd UTC 00
    },
    {
        name: "season_3",
        seasonEndMs: 1742688000000 // March 23rd, 2025
    },
    {
        name: "season_4",
        seasonEndMs: 1834393600000 // 2028
    }
]

export enum VaultName {
    SUSDEBULL_MAINNET = "SUSDEBULL_MAINNET",
    SUSDEBULL_ARB = "SUSDEBULL_ARB",

}

export const ARB_VAULT_PRICE_START_BLOCK = 230322777; // June 2024
export const MAINNET_VAULT_PRICE_START_BLOCK = 20237741; // July 2024

export const DERIVE_VAULTS: Record<VaultName, vaults.VaultConfig> = {
    SUSDEBULL_MAINNET: {
        vaultName: VaultName.SUSDEBULL_MAINNET,
        subaccountId: BigInt(10114),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.LYRA,
        destinationChainAddress: "0x1d080C689B930f9dEa69CB3B4Bc6b8c213DFC2ad",
        derive: "0x0b4eD379da8eF4FCF06F697c5782CA7b4c3E505E",
        predepositUpgradeTimestampMs: 1723680000000, // August 15, 2024
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "ethena": 5,
        }
    },
    SUSDEBULL_ARB: {
        vaultName: VaultName.SUSDEBULL_ARB,
        subaccountId: BigInt(10114),
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.LYRA,
        destinationChainAddress: "0x81494d722DDceDbA31ac40F28daFa66b207f232B",
        derive: "0x0b4eD379da8eF4FCF06F697c5782CA7b4c3E505E",
        predepositUpgradeTimestampMs: 1723680000000, // August 15, 2024
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "ethena": 5,
        }
    }
}

export enum V2AssetName {
    SUSDE = "SUSDE",
    USDE = "USDE",
}


export const VAULT_POOLS: Record<string, vaults.VaultPoolConfig> = {
}

export const V2_ASSETS: Record<V2AssetName, vaults.V2AssetConfig> = {
    SUSDE: {
        assetAndSubId: "0x375804cdcf0d534fdd2657584a7c4ff5ab14a2bb000000000000000000000000", // asset: 0x375804CdcF0D534FDD2657584A7c4Ff5AB14A2bb
        assetName: "SUSDE",
        pointMultipliersPerDay: {
            ethena: 5,
        }
    },
    USDE: {
        assetAndSubId: "0x028b9ffa86fc4c366e11aa8b3e71dc0502713abf000000000000000000000000", // asset: 0x028B9fFA86fc4c366e11AA8b3E71dc0502713ABF
        assetName: "USDE",
        pointMultipliersPerDay: {
            ethena: 20,
        }
    }
}

export const DERIVE_V2_DEPOSIT_START_BLOCK = 13000000; // September 10

// exclude all subaccounts in the vault configs
export const excludedSubaccounts = [...new Set(Object.values(DERIVE_VAULTS).map(config => config.subaccountId))];

export type PointUpdateEvent = {
    account: string;
    assetAndSubIdOrVaultAddress: string;
    assetName: string;

    // earned points
    earnedEthenaPoints: number
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