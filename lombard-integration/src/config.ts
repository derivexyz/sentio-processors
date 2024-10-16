import { EthChainId } from "@sentio/sdk/eth";
import { IntegratorSeason, VaultConfig } from "@derivefinance/derive-sentio-utils";

export const MILLISECONDS_PER_DAY = 60 * 60 * 1000 * 24;

export const SEASONS: IntegratorSeason[] = [
    {
        name: "season_1",
        seasonEndMs: undefined // end of each season in UTC ms
    }
]

/////////////
// Testnet //
/////////////

export const OP_SEPOLIA_VAULT_PRICE_START_BLOCK = 16800000; // [OP sepolia] Start calculating from September 3rd


////////////////
// Production //
//////////////// 

// // export const ARB_VAULT_PRICE_START_BLOCK = 217000000;

export const MAINNET_VAULT_PRICE_START_BLOCK = 20670000; // Start calculating from September 3rd

export const DERIVE_VAULTS: Record<string, VaultConfig> = {
    LBTCPS: {
        vaultName: "LBTCPS",
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.BITLAYER,
        destinationChainAddress: "0x367711f0377867b51Fe53e30F5125a9A31d3D50b",
        // arb: "???",
        derive: "0x5Fc48A32437Ff4BBab2A22646c3c9344ba003971",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 8,
        underlyingDecimals: 8,
        pointMultipliersPerDay: {
            "lombard": 2000,
            "babylon": 100
        }
    },
    LBTCCS: {
        vaultName: "LBTCCS",
        destinationChainId: EthChainId.ETHEREUM,
        deriveChainId: EthChainId.BITLAYER,
        destinationChainAddress: "0x5a27765DbE2476240B1265A305c2e3554fD3f341",
        // arb: "0xb7F56c1a952D3AE664A83971BFfa5c1706947dBD",
        derive: "0xbCab1f8BbA323BC55EA8cfaC34edAcf8DBE92dD4",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 8,
        underlyingDecimals: 8,
        pointMultipliersPerDay: {
            "lombard": 2000,
            "babylon": 100
        }
    },
    LBTCPS_TESTNET: {
        vaultName: "LBTCPS_TESTNET",
        destinationChainId: EthChainId.BOB,
        deriveChainId: EthChainId.TAIKO,
        destinationChainAddress: "0x062F93b9bD9ceb50dcdb1230A9e89CBA36157C33",
        // arb: "???",
        derive: "0x49B9C82582B9916dE295D98b0c55373c300BbaEa",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 8,
        underlyingDecimals: 8,
        pointMultipliersPerDay: {
            "lombard": 2000,
            "babylon": 100
        }
    },
    LBTCCS_TESTNET: {
        vaultName: "LBTCCS_TESTNET",
        destinationChainId: EthChainId.BOB,
        deriveChainId: EthChainId.TAIKO,
        destinationChainAddress: "0x84D8b20275724f31130F76Ecf42a501eDF72C1e0",
        // arb: "???",
        derive: "0x65410Dd3A47f7cdfFd0486D45688F00B142029D7",
        predepositUpgradeTimestampMs: undefined,
        vaultDecimals: 8,
        underlyingDecimals: 8,
        pointMultipliersPerDay: {
            "lombard": 2000,
            "babylon": 100
        }
    }
}

