import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SKILL_DIR = resolve(import.meta.dirname, '..');
const skillYaml = readFileSync(resolve(SKILL_DIR, 'skill.yaml'), 'utf-8');
const skillConfig = require('js-yaml').load(skillYaml);

describe('onboarding-map terminal guard assertions', () => {
  const terminalStates = Object.entries(skillConfig.states)
    .filter(([_, state]) => state.type === 'terminal');

  for (const [name, state] of terminalStates) {
    test(`terminal state ${name} has no outgoing transitions`, () => {
      expect(Object.keys(state.transitions || {})).toHaveLength(0);
    });

    test(`terminal state ${name} has a prompt_template on disk`, () => {
      const templatePath = resolve(SKILL_DIR, 'states', state.prompt_template.replace('states/', ''));
      expect(() => readFileSync(templatePath, 'utf-8')).not.toThrow();
    });
  }
});
