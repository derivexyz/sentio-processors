import { EthContext } from "@sentio/sdk/eth";

export type IntegratorSeason = {
    name: string;
    seasonEndMs: number | undefined;
}

export function getCurrentSeason(integratorSeasons: IntegratorSeason[], currentTimestampMs: bigint): string {
    for (const season of integratorSeasons) {
        if (!season.seasonEndMs) {
            return season.name;
        }

        if (currentTimestampMs < season.seasonEndMs) {
            return season.name;
        }
    }
    throw new Error(`No season found for timestamp ${currentTimestampMs}`);
}
