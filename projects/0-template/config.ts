import type { GameConfig } from '@generate/types'

function getConfig(): GameConfig
{
    return {
        name: "TemplateName",
        languages: [
            { code: 'en', name: 'English', flag: '🇺🇸', default: true },
        ],
    }
}

export default getConfig;
