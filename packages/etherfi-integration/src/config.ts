import { IntegratorSeason, vaults } from "@derivefinance/derive-sentio-utils";
import { BigDecimal } from "@sentio/sdk";
import { EthChainId } from "@sentio/sdk/eth";

// TODO: Fix exact Integrator Season dates


export const INTEGRATOR_SEASONS: IntegratorSeason[] = [
    {
        name: "season_1",
        seasonEndMs: undefined // end of each season in UTC ms

        // NOTE: see temp boost in points in vaults.ts
    }
]

export enum VaultName {
    WEETHC_MAINNET = "WEETHC_MAINNET",
    WEETHC_ARB = "WEETHC_ARB",
    WEETHC_BASE = "WEETHC_BASE",
    WEETHCS_MAINNET = "WEETHCS_MAINNET",
    WEETHCS_ARB = "WEETHCS_ARB",
    WEETHCS_BASE = "WEETHCS_BASE",
    WEETHBULL_MAINNET = "WEETHBULL_MAINNET",
    WEETHBULL_ARB = "WEETHBULL_ARB",
    WEETHBULL_BASE = "WEETHBULL_BASE",
    BWEETH_MAINNET = "BWEETH_MAINNET",
    BWEETH_ARB = "BWEETH_ARB",
    BWEETH_BASE = "BWEETH_BASE",
}

export const ARB_VAULT_PRICE_START_BLOCK = 217000000;
export const MAINNET_VAULT_PRICE_START_BLOCK = 20000000;
export const BASE_VAULT_PRICE_START_BLOCK = 27462000; // Start calculating from Mar 11th

export const MAINNET_BASIS_VAULT_EXCHANGE_START_BLOCK = 22020000;
export const BASE_BASIS_VAULT_EXCHANGE_START_BLOCK = 27462000;
export const ARB_BASIS_VAULT_EXCHANGE_START_BLOCK = 314500000;

export const DERIVE_VAULTS: Record<VaultName, vaults.VaultConfig> = {
    WEETHC_MAINNET: {
        vaultName: VaultName.WEETHC_MAINNET,
        subaccountId: BigInt(5738),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
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
        subaccountId: BigInt(5738),
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.DERIVE,
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
    WEETHC_BASE: {
        vaultName: "WEETHC_BASE",
        subaccountId: BigInt(5738),
        destinationChainId: EthChainId.BASE,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0xdE45E2bCCb99E0ed1a2876cFC51a71ca5e822641",
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
        subaccountId: BigInt(10301),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
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
        vaultName: VaultName.WEETHCS_ARB,
        subaccountId: BigInt(10301),
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.DERIVE,
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
    WEETHCS_BASE: {
        vaultName: VaultName.WEETHCS_BASE,
        subaccountId: BigInt(10301),
        destinationChainId: EthChainId.BASE,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0x85afa764A366d70d241513e3cBDAdd97A9A74e21",
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
        vaultName: VaultName.WEETHBULL_MAINNET,
        subaccountId: BigInt(10303),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
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
        vaultName: VaultName.WEETHBULL_ARB,
        subaccountId: BigInt(10303),
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.DERIVE,
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
    WEETHBULL_BASE: {
        vaultName: VaultName.WEETHBULL_BASE,
        subaccountId: BigInt(10303),
        destinationChainId: EthChainId.BASE,
        deriveChainId: EthChainId.DERIVE,
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
    BWEETH_MAINNET: {
        vaultName: VaultName.BWEETH_MAINNET,
        subaccountId: BigInt(47974),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0x32390aD170c9604fa97A894C353a4511C0D4b4C2",
        derive: "0x513Dc0e3407CA3A6E073A2f2d43fd61498db5739",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        }
    },
    BWEETH_ARB: {
        vaultName: VaultName.BWEETH_ARB,
        subaccountId: BigInt(47974),
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0x254691C06Da387c1050C726cF498eFdA89083820",
        derive: "0x513Dc0e3407CA3A6E073A2f2d43fd61498db5739",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        }
    },
    BWEETH_BASE: {
        vaultName: VaultName.BWEETH_BASE,
        subaccountId: BigInt(47974),
        destinationChainId: EthChainId.BASE,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0xA0B0b5ff5A45D054E2517CB1903C1713E199Fc55",
        derive: "0x513Dc0e3407CA3A6E073A2f2d43fd61498db5739",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "etherfi": 20000,
            "eigenlayer": 21,
        }
    },
}


export const VAULT_POOLS: Record<string, vaults.VaultPoolConfig> = {
    SWELL_L2: {
        chainId: EthChainId.ETHEREUM,
        address: "0x38D43a6Cb8DA0E855A42fB6b0733A0498531d774",
        name: "SWELL_L2"
    }
}

export const V2_ASSETS: Record<string, vaults.V2AssetConfig> = {
    WEETH: {
        assetAndSubId: "0xf30ee744fcfd135a135e6a4e327e01d0f697e6ec000000000000000000000000", // asset: 0xF30EE744fCfd135A135E6a4e327e01d0f697e6Ec
        assetName: "WEETH",
        assetAddress: "0xF30EE744fCfd135A135E6a4e327e01d0f697e6Ec",
        subId: BigInt(0),
        pointMultipliersPerDay: {
            etherfi: 20000,
            eigenlayer: 21,
            lombard: 100,
            babylon: 100
        }
    },
    EBTC: {
        assetAndSubId: "0x95fe344a0f420a7ac1b1e69cb1474179a40db882000000000000000000000000", // asset: 0x95FE344A0f420A7aC1B1E69CB1474179a40db882
        assetName: "EBTC",
        assetAddress: "0x95FE344A0f420A7aC1B1E69CB1474179a40db882",
        subId: BigInt(0),
        pointMultipliersPerDay: {
            etherfi: 20000,
            eigenlayer: 21,
            lombard: 100,
            babylon: 100
        }
    },
}

export const DERIVE_V2_DEPOSIT_START_BLOCK = 10000000; // July 3rd

// exclude all subaccounts in the vault configs
export const excludedSubaccounts = [...new Set(Object.values(DERIVE_VAULTS).map(config => config.subaccountId))];

export type PointUpdateEvent = {
    account: string;
    assetAndSubIdOrVaultAddress: string;
    assetName: string;

    // earned points
    earnedEtherfiPoints: number
    earnedEigenlayerPoints: number;
    earnedLombardPoints: number;
    earnedBabylonPoints: number;
    // last snapshot
    lastTimestampMs: bigint;
    lastBalance: BigDecimal;
    lastEffectiveBalance: BigDecimal;
    // new snapshot
    newTimestampMs: bigint;
    newBalance: BigDecimal;
    newEffectiveBalance: BigDecimal;

}