import { EthChainId } from "@sentio/sdk/eth";

export type VaultConfig = {
    vaultName: string;
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
    assetName: string;
    pointMultipliersPerDay: Record<string, number>;
}

