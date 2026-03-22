// ============================================
// features.js (Safe Version)
// ============================================

function normalizeText(text) {
  // 너무 긴 텍스트는 성능을 위해 자름
  const safeText = text.length > 1000000 ? text.substring(0, 1000000) : text;
  return safeText
    .replace(/\s+/g, " ") // 공백 정리
    .replace(/[^\x20-\x7E]/g, "") // 비ASCII 제거
    .toLowerCase();
}

function lengthFeatures(text) {
  const lines = text.split("\n");
  return {
    length: text.length,
    lineCount: lines.length,
    avgLineLength: text.length / Math.max(1, lines.length)
  };
}

function charStats(text) {
  const total = text.length || 1;
  let digits = 0, letters = 0, symbols = 0;
  for (const c of text) {
    if (/[0-9]/.test(c)) digits++;
    else if (/[a-z]/i.test(c)) letters++;
    else symbols++;
  }
  return {
    digitRatio: digits / total,
    letterRatio: letters / total,
    symbolRatio: symbols / total
  };
}

function entropy(text) {
  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;
  let ent = 0;
  const len = text.length || 1;
  for (const c in freq) {
    const p = freq[c] / len;
    ent -= p * Math.log2(p);
  }
  return ent;
}

const SUSPICIOUS_KEYWORDS = [
  "eval", "function(", "new function", "settimeout(", "setinterval(",
  "atob(", "fromcharcode", "document.write", "window.location", "unescape("
];

function keywordFeatures(text) {
  const features = {};
  for (const key of SUSPICIOUS_KEYWORDS) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    features[key] = (text.match(regex) || []).length;
  }
  return features;
}

function networkHints(text) {
  return {
    hasHttp: /http:\/\//.test(text) ? 1 : 0,
    hasHttps: /https:\/\//.test(text) ? 1 : 0,
    hasIP: /\b\d{1,3}(\.\d{1,3}){3}\b/.test(text) ? 1 : 0
  };
}

function structureFeatures(text) {
  // [중요] 스택 오버플로우 방지를 위해 텍스트 길이 제한
  const safeText = text.length > 500000 ? text.substring(0, 500000) : text;
  
  return {
    scriptTagCount: (safeText.match(/<script/gi) || []).length,
    iframeCount: (safeText.match(/<iframe/gi) || []).length,
    // 정규식 백트래킹 방지를 위해 매칭 범위 최적화
    base64Like: (safeText.match(/[A-Za-z0-9+/]{500,}/g) || []).length
  };
}

function extractFeatures(rawText) {
  // 전처리를 통해 안전한 길이의 텍스트 확보
  const text = normalizeText(rawText);
  
  const f1 = lengthFeatures(text);
  const f2 = charStats(text);
  const f3 = keywordFeatures(text);
  const f4 = networkHints(text);
  const f5 = structureFeatures(text);

  // 모델이 기대하는 14개 피처 순서로 반환 (개수 주의!)
  // 기존 코드의 반환 방식과 동일하게 맞춤
  return [
    f1.length,
    f1.lineCount,
    f1.avgLineLength,
    f2.digitRatio,
    f2.letterRatio,
    f2.symbolRatio,
    entropy(text),
    f4.hasHttp,
    f4.hasHttps,
    f4.hasIP,
    f5.scriptTagCount,
    f5.iframeCount,
    f5.base64Like,
    (text.match(/eval/g) || []).length // 14번째 피처 예시
  ];
}