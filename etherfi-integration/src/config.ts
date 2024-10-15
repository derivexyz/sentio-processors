
export const MILLISECONDS_PER_DAY = 60 * 60 * 1000 * 24;

export type VaultConfig = {
    mainnet: string;
    arb: string;
    lyra: string;
    predepositUpgradeTimestampMs: number | undefined;
    etherfiPointsPerDay: number;
    eigenlayerPointsPerDay: number;
};

export const ARB_VAULT_PRICE_START_BLOCK = 217000000;
export const MAINNET_VAULT_PRICE_START_BLOCK = 20000000;

export const LYRA_VAULTS: Record<string, VaultConfig> = {
    WETHC: {
        mainnet: "0xcAe44C93f7B3b519Fc28f9d4F7Ae22dE770a907b",
        arb: "0x1cbbC18CB128AA470733eD29938Ab4878B0BEF20",
        lyra: "0xec68928bd83B2E52fF5A8e8c215B6ea72879F521",
        predepositUpgradeTimestampMs: 1720252800000,
        etherfiPointsPerDay: 20000,
        eigenlayerPointsPerDay: 21
    },
    WETHCS: {
        mainnet: "0x91e3489da66eD36ebe0Be1013D87449447FD2bFa",
        arb: "0xb7F56c1a952D3AE664A83971BFfa5c1706947dBD",
        lyra: "0x12ab0242b3e8d4502FebCED6C2d52fD23F7262af",
        predepositUpgradeTimestampMs: undefined,
        etherfiPointsPerDay: 20000,
        eigenlayerPointsPerDay: 21
    },
    WETHBULL: {
        mainnet: "0xC7EE36E027272F11135792FaDE64D9365Cc583B5",
        arb: "0xC7EE36E027272F11135792FaDE64D9365Cc583B5",
        lyra: "0xe48cdbe3A233Ea577c9ee6959801e7730e516d1A",
        predepositUpgradeTimestampMs: undefined,
        etherfiPointsPerDay: 20000,
        eigenlayerPointsPerDay: 21
    },
}

export type V2AssetConfig = {
    assetAndSubId: string;
    assetName: string;
    etherfiPointsPerDay: number;
    lombardPointPerDay: number;
    babylonPointsPerDay: number;
}

export const V2_ASSETS: Record<string, V2AssetConfig> = {
    WETH: {
        assetAndSubId: "0x",
        assetName: "WETH",
        etherfiPointsPerDay: 10000,
        lombardPointPerDay: 100,
        babylonPointsPerDay: 100
    },
    EBTC: {
        assetAndSubId: "0x",
        assetName: "EBTC",
        etherfiPointsPerDay: 10000,
        lombardPointPerDay: 10000,
        babylonPointsPerDay: 24
    },
}