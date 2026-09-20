/**
 * Metrics Middleware Hook
 * Trigger: post_transition
 * Purpose: Emit Prometheus-compatible metrics for security-scan
 */

const fs = require('fs');
const path = require('path');

let transitionCount = 0;
let stateDurations = {};

module.exports = async function metrics(hookCtx) {
  transitionCount++;

  const { skill_id, from_state, to_state, timestamp } = hookCtx;

  const metricsLine = `# TYPE reactive_skill_${skill_id}_transitions counter\n` +
    `reactive_skill_${skill_id}_transitions_total{from="${from_state}", to="${to_state}"} ${transitionCount}\n` +
    `# TYPE reactive_skill_${skill_id}_current_state gauge\n` +
    `reactive_skill_${skill_id}_current_state{state="${to_state}"} 1\n`;

  const metricsDir = path.resolve(process.cwd(), '.reactive', 'metrics');
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  fs.writeFileSync(path.resolve(metricsDir, `${skill_id}.prom`), metricsLine);
};
