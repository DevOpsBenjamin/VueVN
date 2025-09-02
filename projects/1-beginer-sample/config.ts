import type { GameConfig } from '@generate/types'

function getConfig(): GameConfig
{
    return {
        name: "Beginer Sample",
        languages: [
            { code: 'en', name: 'English', flag: '🇺🇸', default: true },
        ],
    }
}

export default getConfig;
