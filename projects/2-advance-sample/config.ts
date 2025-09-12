import type { GameConfig } from '@generate/types'

function getConfig(): GameConfig
{
    return {
        name: "Advance Sample",
        languages: [
            { code: 'en', name: 'English', flag: '🇺🇸', default: true },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        ],
    }
}

export default getConfig;
