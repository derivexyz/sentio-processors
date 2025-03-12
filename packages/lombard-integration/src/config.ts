import { EthChainId } from "@sentio/sdk/eth";
import { IntegratorSeason, vaults } from "@derivefinance/derive-sentio-utils";
import { VaultConfig } from "@derivefinance/derive-sentio-utils/dist/vaults/vaultConfig.js";
import { BigDecimal } from "@sentio/sdk";

export const MILLISECONDS_PER_DAY = 60 * 60 * 1000 * 24;

export const SEASONS: IntegratorSeason[] = [
    {
        name: "season_1",
        seasonEndMs: undefined // end of each season in UTC ms
    }
]

////////////////
// Production //
//////////////// 

export const MAINNET_VAULT_PRICE_START_BLOCK = 20670000; // Start calculating from September 3rd
export const BASE_VAULT_PRICE_START_BLOCK = 27462000; // Start calculating from Mar 11th

export const MAINNET_BASIS_VAULT_EXCHANGE_START_BLOCK = 22020000;
export const BASE_BASIS_VAULT_EXCHANGE_START_BLOCK = 27462000;


export const DERIVE_VAULTS: Record<string, VaultConfig> = {
    LBTCPS: {
        vaultName: "LBTCPS",
        subaccountId: BigInt(10628),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0x367711f0377867b51Fe53e30F5125a9A31d3D50b",
        derive: "0x5Fc48A32437Ff4BBab2A22646c3c9344ba003971",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 8,
        underlyingDecimals: 8,
        pointMultipliersPerDay: {
            "lombard": 2000, // 2x * 1000 points per day
            "babylon": 100
        }
    },
    LBTCCS: {
        vaultName: "LBTCCS",
        subaccountId: BigInt(10629),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0x5a27765DbE2476240B1265A305c2e3554fD3f341",
        derive: "0xbCab1f8BbA323BC55EA8cfaC34edAcf8DBE92dD4",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 8,
        underlyingDecimals: 8,
        pointMultipliersPerDay: {
            "lombard": 2000, // 2x * 1000 points per day
            "babylon": 100
        }
    },
    LBTCB_MAINNET: {
        vaultName: "LBTCB_MAINNET",
        subaccountId: BigInt(47975),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0xD5E977760EbD45D022500a0561741322dA5b04Da",
        derive: "0x2104654d6Da663961a86AC3Cf1751981C5dc62E8",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 8,
        underlyingDecimals: 8,
        pointMultipliersPerDay: {
            "lombard": 2000, // 2x * 1000 points per day
            "babylon": 100
        }
    },
    LBTCB_BASE: {
        vaultName: "LBTCB_BASE",
        subaccountId: BigInt(47975),
        destinationChainId: EthChainId.BASE,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0xe4f79D7e8Bf3639EFb0c63a38A5ffF7942377986",
        derive: "0x2104654d6Da663961a86AC3Cf1751981C5dc62E8",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 8,
        underlyingDecimals: 8,
        pointMultipliersPerDay: {
            "lombard": 2000, // 2x * 1000 points per day
            "babylon": 100
        }
    },
}


export enum V2AssetName {
    LBTC = "LBTC",
}

export const V2_ASSETS: Record<V2AssetName, vaults.V2AssetConfig> = {
    LBTC: {
        assetAndSubId: "0xeaf03bb3280c609d35e7f84d24a996c7c0b74f5f000000000000000000000000", // asset: 0xeaF03Bb3280C609d35E7F84d24a996c7C0b74F5f
        assetAddress: "0xeaF03Bb3280C609d35E7F84d24a996c7C0b74F5f",
        subId: BigInt(0),
        assetName: "LBTC",
        pointMultipliersPerDay: {
            "lombard": 3000, // 3x * 1000 points per day
            "babylon": 100
        }
    }
}

export const DERIVE_V2_DEPOSIT_START_BLOCK = 12500000; // Aug 30th -> change this

// exclude all subaccounts in the vault configs
export const excludedSubaccounts = [...new Set(Object.values(DERIVE_VAULTS).map(config => config.subaccountId))];

export type PointUpdateEvent = {
    account: string;
    assetAndSubIdOrVaultAddress: string;
    assetName: string;

    // earned points
    earnedLombardPoints: number
    earnedBabylonPoints: number;
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