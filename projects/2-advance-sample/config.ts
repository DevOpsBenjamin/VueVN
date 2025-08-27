import type { GameConfig } from '@generate/types'

function getConfig(): GameConfig
{
    return {
        name: "Advance Sample",
        defaultLanguage: "en",
    }
}

export default getConfig;