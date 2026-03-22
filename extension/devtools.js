// ============================================
// devtools.js
// DevTools Malware Scanner - ML Pipeline (Final Version)
// ============================================

let model = null;
let modelReady = false;
let pageScores = [];

// ---- 모델 로드 (TF.js) ----
async function loadModel() {
  try {
    const modelUrl = chrome.runtime.getURL("model/model.json");
    model = await tf.loadLayersModel(modelUrl);
    modelReady = true;
    console.log("[ML] Model loaded successfully");
  } catch (err) {
    console.error("[ML] Model loading failed:", err);
  }
}

loadModel();

// ---- 패널 생성 ----
chrome.devtools.panels.create("Malware Scanner", null, "panel.html", null);

// ---- 휴리스틱 분석 (안전한 정규식 처리) ----
function extractHeuristics(body) {
  // 정규식 엔진 보호를 위해 1MB로 제한
  const safeBody = body.length > 1000000 ? body.substring(0, 1000000) : body;
  
  return {
    hasEval: /eval\s*\(/.test(safeBody),
    hasFunctionCtor: /new Function/.test(safeBody),
    hasBase64: /atob\s*\(/.test(safeBody),
    hasIframe: /<iframe/i.test(safeBody),
    longEncodedString: /[A-Za-z0-9+/]{1000,}/.test(safeBody)
  };
}

function computeHeuristicScore(flags) {
  let score = 0;
  if (flags.hasEval) score += 0.5;
  if (flags.hasFunctionCtor) score += 0.4;
  if (flags.hasIframe) score += 0.2;
  if (flags.hasBase64) score += 0.1;
  if (flags.longEncodedString) score += 0.1;
  return Math.min(score, 1.0);
}

// ---- 점수 계산 로직 (오탐 방지) ----
function calculateFinalScore(mlScore, heuristicScore) {
  // ML이 위험하다고 해도 명확한 휴리스틱 증거가 없으면 점수 하향
  if (mlScore > 0.8 && heuristicScore === 0) return 0.65;
  if (heuristicScore > 0.6) return Math.max(mlScore, heuristicScore);
  return 0.5 * mlScore + 0.5 * heuristicScore;
}

function adaptFeatures(features) {
  let numeric = features.filter(v => typeof v === "number");
  if (numeric.length > 14) numeric = numeric.slice(0, 14);
  else if (numeric.length < 14) numeric = numeric.concat(new Array(14 - numeric.length).fill(0));
  return numeric;
}

function predictMalicious(features) {
  if (!modelReady) return null;
  const input = tf.tensor2d([features], [1, 14]);
  const output = model.predict(input);
  const score = output.dataSync()[0];
  input.dispose(); 
  output.dispose();
  return score;
}

function computePageRisk(scores) {
  if (!scores || scores.length === 0) return { pageRisk: 0, maxScore: 0, suspiciousCount: 0, total: 0 };
  const maxScore = Math.max(...scores);
  const threshold = 0.8;
  const suspiciousCount = scores.filter(s => s >= threshold).length;
  const pageRisk = 0.7 * maxScore + 0.3 * (suspiciousCount / scores.length);
  return { pageRisk, maxScore, suspiciousCount, total: scores.length };
}

// ---- 네트워크 리스너 (성능, 에러 방어 및 로그 강화) ----
chrome.devtools.network.onRequestFinished.addListener((request) => {
  request.getContent((body) => {
    // 입구 컷
    if (!body || body.length < 300 || body.length > 2000000) return;
    if (!modelReady || !chrome.runtime || !chrome.runtime.id) return;

    try {
      // 피처 추출 및 분석
      const safeBody = body.length > 1000000 ? body.substring(0, 1000000) : body;
      const rawFeatures = extractFeatures(safeBody).slice(0, 14);
      const features = adaptFeatures(rawFeatures);
      
      const mlScore = predictMalicious(features);
      if (mlScore === null) return;

      const heuristicFlags = extractHeuristics(body);
      const hScore = computeHeuristicScore(heuristicFlags);
      const finalScore = calculateFinalScore(mlScore, hScore);

      pageScores.push(finalScore);
      const result = computePageRisk(pageScores);
      const verdict = finalScore >= 0.8 ? "MALICIOUS" : "BENIGN";

      // ============================================================
      // [추가] 검사 콘솔창에서도 로그를 볼 수 있도록 직접 출력
      // ============================================================
      const shortUrl = request.request.url.split('?')[0]; // URL 깔끔하게 출력용
      console.log(`%c[Scan Result] ${verdict}`, `color: ${verdict === "MALICIOUS" ? "red" : "green"}; font-weight: bold;`);
      console.log(`URL: ${shortUrl}`);
      console.log(`Scores -> Final: ${finalScore.toFixed(3)}, ML: ${mlScore.toFixed(3)}, Heuristic: ${hScore.toFixed(3)}`);
      console.log(`Page Total Risk: ${result.pageRisk.toFixed(3)}`);
      console.log('--------------------------------------------');

      // 패널로 전송 (기존 로직 유지)
      chrome.runtime.sendMessage({
        type: "NEW_SCAN_RESULT",
        payload: {
          url: request.request.url,
          finalScore: finalScore.toFixed(3),
          mlScore: mlScore.toFixed(3),
          heuristicScore: hScore.toFixed(3),
          verdict: verdict,
          pageRisk: result.pageRisk.toFixed(3)
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          // 패널이 닫혀있을 때만 이 로그가 찍힘
          console.debug("[Message] Panel is currently closed. (Data sent to DevTools Console instead)");
        }
      });

    } catch (err) {
      console.error("[SCAN ERROR]", err);
    }
  });
});

// 페이지 이동 시 리셋
chrome.devtools.network.onNavigated.addListener(() => {
  pageScores = [];
  try {
    chrome.runtime.sendMessage({ type: "NAVIGATED_RESET" }, () => {
      if (chrome.runtime.lastError) { /* ignore */ }
    });
  } catch (e) {}
});
