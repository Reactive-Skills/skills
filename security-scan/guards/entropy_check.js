/**
 * Entropy Check Guard Function
 * Determines if a string has high entropy indicating a potential secret.
 * Used as a custom guard in skill.yaml transitions.
 *
 * Usage: guardFunction: "guards/entropy_check.js"
 * The runtime calls: entropyCheck(payload.string, payload.threshold)
 */

function shannonEntropy(str) {
  const len = str.length;
  if (len === 0) return 0;

  const freq = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function isHighEntropy(str, threshold = 3.5) {
  if (!str || str.length < 8) return false;
  return shannonEntropy(str) >= threshold;
}

function isPotentialSecret(value) {
  const patterns = [
    /^AKIA[0-9A-Z]{16}$/,
    /^ghp_[A-Za-z0-9]{36}$/,
    /^sk-[a-zA-Z0-9]{20,}$/,
    /^eyJ[A-Za-z0-9._-]+$/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(value)) {
      return { matched: true, confidence: 'high' };
    }
  }

  if (isHighEntropy(value)) {
    return { matched: true, confidence: 'medium', entropy: shannonEntropy(value) };
  }

  return { matched: false };
}

module.exports = {
  shannonEntropy,
  isHighEntropy,
  isPotentialSecret,
};
