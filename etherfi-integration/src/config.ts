import { IntegratorSeason, V2AssetConfig, VaultConfig, VaultPoolConfig } from "@derivefinance/derive-sentio-utils";
import { EthChainId } from "@sentio/sdk/eth";

export const MILLISECONDS_PER_DAY = 60 * 60 * 1000 * 24;

export const INTEGRATOR_SEASONS: IntegratorSeason[] = [
    {
        name: "season_1",
        seasonEndMs: undefined // end of each season in UTC ms
    }
]

export const ARB_VAULT_PRICE_START_BLOCK = 217000000;
export const MAINNET_VAULT_PRICE_START_BLOCK = 20000000;

export const LYRA_VAULTS: Record<string, VaultConfig> = {
    WEETHC_MAINNET: {
        vaultName: "WEETHC_MAINNET",
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.LYRA,
        destinationChainAddress: "0xcAe44C93f7B3b519Fc28f9d4F7Ae22dE770a907b",
        derive: "0xec68928bd83B2E52fF5A8e8c215B6ea72879F521",
        predepositUpgradeTimestampMs: 1720252800000,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        }
    },
    WEETHC_ARB: {
        vaultName: "WEETHC_ARB",
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.LYRA,
        destinationChainAddress: "0x1cbbC18CB128AA470733eD29938Ab4878B0BEF20",
        derive: "0xec68928bd83B2E52fF5A8e8c215B6ea72879F521",
        predepositUpgradeTimestampMs: 1720252800000,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        },
    },
    WEETHCS_MAINNET: {
        vaultName: "WEETHCS_MAINNET",
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.LYRA,
        destinationChainAddress: "0x91e3489da66eD36ebe0Be1013D87449447FD2bFa",
        derive: "0x12ab0242b3e8d4502FebCED6C2d52fD23F7262af",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        }
    },
    WEETHCS_ARB: {
        vaultName: "WEETHCS_ARB",
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.LYRA,
        destinationChainAddress: "0xb7F56c1a952D3AE664A83971BFfa5c1706947dBD",
        derive: "0x12ab0242b3e8d4502FebCED6C2d52fD23F7262af",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        }
    },
    WEETHBULL_MAINNET: {
        vaultName: "WEETHBULL_MAINNET",
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.LYRA,
        destinationChainAddress: "0xC7EE36E027272F11135792FaDE64D9365Cc583B5",
        derive: "0xe48cdbe3A233Ea577c9ee6959801e7730e516d1A",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        }
    },
    WEETHBULL_ARB: {
        vaultName: "WEETHBULL_ARB",
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.LYRA,
        destinationChainAddress: "0xC7EE36E027272F11135792FaDE64D9365Cc583B5",
        derive: "0xe48cdbe3A233Ea577c9ee6959801e7730e516d1A",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        }
    },
}

export const V2_ASSETS: Record<string, V2AssetConfig> = {
    WEETH: {
        assetAndSubId: "0x",
        assetName: "WEETH",
        pointMultipliersPerDay: {
            etherfi: 20000,
            eigenlayer: 21,
            lombard: 100,
            babylon: 100
        }
    },
    EBTC: {
        assetAndSubId: "0x",
        assetName: "EBTC",
        pointMultipliersPerDay: {
            etherfi: 20000,
            eigenlayer: 21,
            lombard: 100,
            babylon: 100
        }
    },
}

export const VAULT_POOLS: Record<string, VaultPoolConfig> = {
    SWELL_L2: {
        chainId: EthChainId.ETHEREUM,
        address: "0x38D43a6Cb8DA0E855A42fB6b0733A0498531d774",
        name: "SWELL_L2"
    }
}