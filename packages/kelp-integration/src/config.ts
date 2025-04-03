import { IntegratorSeason, vaults } from "@derivefinance/derive-sentio-utils";
import { BigDecimal } from "@sentio/sdk";
import { EthChainId } from "@sentio/sdk/eth";

// TODO: Fix exact Integrator Season dates

export const INTEGRATOR_SEASONS: IntegratorSeason[] = [
    {
        name: "season_1",
        seasonEndMs: undefined // end of each season in UTC ms
    }
]

export enum VaultName {
    RSETHC_MAINNET = "RSETHC_MAINNET",
    RSETHC_ARB = "RSETHC_ARB",
    RSETHC_BASE = "RSETHC_BASE",
}

export const ARB_VAULT_PRICE_START_BLOCK = 217000000;
export const MAINNET_VAULT_PRICE_START_BLOCK = 20000000;
export const BASE_VAULT_PRICE_START_BLOCK = 28000000;

export const DERIVE_VAULTS: Record<VaultName, vaults.VaultConfig> = {
    RSETHC_MAINNET: {
        vaultName: VaultName.RSETHC_MAINNET,
        subaccountId: BigInt(5740),
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0xF90b959ae8dfBa2DD793AD05176209835658362b",
        derive: "0xd35bb8582809b4BDa4F8bCCE1bde48559f63eCbf",
        predepositUpgradeTimestampMs: 1720252800000,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "kelp": 20000,
            "eigenlayer": 21,
        }
    },
    RSETHC_ARB: {
        vaultName: VaultName.RSETHC_ARB,
        subaccountId: BigInt(5740),
        destinationChainId: EthChainId.ARBITRUM,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0x8F5d8a65D98925E10BA83b5C1C5c3BE100f7591B",
        derive: "0xd35bb8582809b4BDa4F8bCCE1bde48559f63eCbf",
        predepositUpgradeTimestampMs: 1720252800000,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "kelp": 20000,
            "eigenlayer": 21,
        },
    },
    RSETHC_BASE: {
        vaultName: VaultName.RSETHC_BASE,
        subaccountId: BigInt(5740),
        destinationChainId: EthChainId.BASE,
        deriveChainId: EthChainId.DERIVE,
        destinationChainAddress: "0xd464170afe0eE2a4865B2ca6dBcc6dfB8f4Bf125",
        derive: "0xd35bb8582809b4BDa4F8bCCE1bde48559f63eCbf",
        predepositUpgradeTimestampMs: 1720252800000,
        vaultDecimals: 18,
        underlyingDecimals: 18,
        pointMultipliersPerDay: {
            "kelp": 20000,
            "eigenlayer": 21,
        },
    }
}


export enum V2AssetName {
    RSETH = "RSETH",
}


export const V2_ASSETS: Record<V2AssetName, vaults.V2AssetConfig> = {
    RSETH: {
        assetAndSubId: "0x35fdb6e79c05809ba6dc3b2ef5ff7d0bb5d75020000000000000000000000000", // asset: 0x35fdB6e79c05809ba6Dc3B2EF5FF7D0BB5D75020
        assetName: "RSETH",
        assetAddress: "0x35fdB6e79c05809ba6Dc3B2EF5FF7D0BB5D75020",
        subId: BigInt(0),
        pointMultipliersPerDay: {
            kelp: 20000,
            eigenlayer: 21,
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
    earnedKelpPoints: number
    earnedEigenlayerPoints: number;
    // last snapshot
    lastTimestampMs: bigint;
    lastBalance: BigDecimal;
    lastEffectiveBalance: BigDecimal;
    // new snapshot
    newTimestampMs: bigint;
    newBalance: BigDecimal;
    newEffectiveBalance: BigDecimal;

}