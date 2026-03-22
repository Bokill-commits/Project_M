const resultBody = document.getElementById('result-body');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NEW_SCAN_RESULT") {
    const data = message.payload;
    const riskValue = parseFloat(data.pageRisk);

    const riskBadge = document.getElementById('page-risk');
    const gaugeBar = document.getElementById('gauge-bar');
    const statusText = document.getElementById('status-text');
    
    if (riskBadge && gaugeBar) {
      riskBadge.textContent = `Page Risk: ${data.pageRisk}`;
      const percentage = Math.min(riskValue * 100, 100); 
      gaugeBar.style.width = `${percentage}%`;

      let mainColor, bgColor, textColor, label;

      if (riskValue >= 0.8) {
        mainColor = '#d93025'; bgColor = '#fce8e6'; textColor = '#d93025'; label = '상태: 위험 🚨';
      } else if (riskValue >= 0.5) {
        mainColor = '#f9ab00'; bgColor = '#fff4e5'; textColor = '#b06000'; label = '상태: 주의 ⚠️';
      } else {
        mainColor = '#1e8e3e'; bgColor = '#e6f4ea'; textColor = '#1e8e3e'; label = '상태: 안전 ✅';
      }

      // 디자인 적용
      riskBadge.style.backgroundColor = bgColor;
      riskBadge.style.color = textColor;
      gaugeBar.style.backgroundColor = mainColor;
      if (statusText) {
        statusText.textContent = label;
        statusText.style.color = mainColor;
      }
    }

    // 테이블 로그 추가 로직
    if (resultBody) {
      const row = document.createElement('tr');
      const isMalicious = data.verdict === "MALICIOUS";
      if (isMalicious) row.style.backgroundColor = "#fff0f0";
      row.innerHTML = `
        <td title="${data.url}" style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${data.url}</td>
        <td style="text-align:center;">${data.finalScore}</td>
        <td style="text-align:center;">${data.mlScore}</td>
        <td style="text-align:center;">${data.heuristicScore}</td>
        <td style="text-align:center; font-weight:bold; color:${isMalicious ? '#d93025' : '#1e8e3e'}">${data.verdict}</td>
      `;
      resultBody.insertBefore(row, resultBody.firstChild);
    }
    return true; 
  }

  // 페이지 이동 시 리셋 로직
  if (message.type === "NAVIGATED_RESET") {
    if (resultBody) resultBody.innerHTML = '';
    const rb = document.getElementById('page-risk');
    const gb = document.getElementById('gauge-bar');
    const st = document.getElementById('status-text');
    if (rb) {
      rb.textContent = 'Page Risk: 0.000';
      rb.style.backgroundColor = '#e6f4ea';
      rb.style.color = '#1e8e3e';
    }
    if (gb) { gb.style.width = '0%'; gb.style.backgroundColor = '#1e8e3e'; }
    if (st) { st.textContent = '상태: 안전 ✅'; st.style.color = '#1e8e3e'; }
  }
});