import { EthChainId } from "@sentio/sdk/eth";

export type VaultConfig = {
    vaultName: string;
    subaccountId: bigint;
    destinationChainId: EthChainId;
    deriveChainId: EthChainId;
    destinationChainAddress: string;
    // arb: string;
    derive: string;
    predepositUpgradeTimestampMs?: number;
    vaultDecimals: number;
    underlyingDecimals: number;
    pointMultipliersPerDay: Record<string, number>;
};

export type VaultPoolConfig = {
    chainId: EthChainId;
    address: string;
    name: string;
}

export type V2AssetConfig = {
    assetAndSubId: string;
    assetAddress: string;
    subId: bigint;
    assetName: string;
    pointMultipliersPerDay: Record<string, number>;
}

export function isVaultSubaccount(subaccountId: bigint, allVaults: VaultConfig[]): boolean {
    for (const vault of allVaults) {
        if (vault.subaccountId === subaccountId) {
            return true;
        }
    }
    return false;
}

