// Templates d'event pour l'éditeur Monaco
export const eventTemplate: string = `/**
 * @typedef {Object}
 * @property {string} id
 * * @property {string} name
 * @property {(state: Object) => boolean} conditions
 * @property {(engine: Engine, state: Object) => Promise<void>} execute
 */

export default {
  id: 'new_event',
  name: 'Nouvel évènement',
  conditions: (state) => true,
  async execute(engine, state) {
    await engine.showText('Début de l\'évènement...')
  }
}
`;