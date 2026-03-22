# 🚨 Project_M | 멀웨어위험감지 확장프로그램

본 프로젝트는 **웹 트래픽 기반으로 위험 행위를 탐지하고 예측하는 실시간 악성 행위 탐지 시스템**입니다.  
Chrome DevTools를 활용하여 브라우저 트래픽을 수집하고,  
행위 기반 Feature를 통해 의심 트래픽을 탐지합니다.

##

학습모델 테스트 영상<br>
<br>
[![Youtube](https://img.shields.io/badge/Youtube-Project__M-red?logo=youtube&logoColor=white)](https://youtu.be/Ly1jYo7CWos)

---

## 📌 프로젝트 개요

정상 사용자 트래픽과 자동화·악성 트래픽이 혼재되면서  
크롤링 및 봇 트래픽이 증가하고 탐지 난이도가 상승하고 있습니다.

이에 따라,
- 패킷/페이로드 분석 없이
- **행위 기반 Feature만으로 의심 트래픽 탐지 가능성 검증** 을 목표로 프로젝트를 진행했습니다.

---

## 🛠️ 기술 스택

- Python
- HTML
- JS
- CSS
- Numpy
- Tensorflow
- Scikit-learn
- Chrome DevTools
- JSON 기반 데이터 처리

---

## ⚙️ 시스템 구성

- Chrome DevTools 기반 트래픽 수집
- 실시간 스캔 로직 구현
- 임계값 초과 시 사용자 경고 알림 시스템

---

## 📁 프로젝트 구조

Project_M/
├── damage_detection/            # 차량 손상 여부 판단 시스템
│   ├── car/
│   ├── checkpoints/
│   ├── pipeline/
│   ├── result/
│   └── uploads/
├── driver_matching_system/      # 기사 매칭 / 경로 추천 시스템
│   ├── delivery_orders_2026.csv
│   ├── delivery_orders_2026_utf8.csv
│   └── driver_matching_system.ipynb
├── review_sentiment_system/     # 리뷰 감정 분석 시스템
│   ├── drivers_2026.xlsx
│   ├── review_label.csv
│   └── review_sentiment_system.ipynb
├── database/                    # 데이터베이스
│   ├── mysql
│   └── mysql-installer-web-community-8.0.44.0.msi
│
└── web/                         # 웹 구동

---

## 📊 데이터 구성

- 데이터 형식: JSON
- 전체 트래픽 수: 4046건
- 학습 데이터: 506건 (조건 충족 데이터만 사용)
- Feature 수: 14개

---

## 🧹 데이터 전처리

- 분석 기준 충족 데이터 선별
- 불필요 로그 제거
- 학습/평가 데이터 분리
- Feature 정규화 (Scaling)
- 클래스 불균형 대응
- 클래스 가중치 적용

---

## 🔍 문제 정의

- 웹 트래픽 기반 이진 분류
  - `0`: Benign (정상)
  - `1`: Suspicious (의심)

- 분석 범위
  - ❌ 패킷 분석 제외
  - ❌ 페이로드 분석 제외
  - ✅ 행위 기반 Feature 사용

- 데이터 특성
  - Rule 기반 Weak Labeling
  - 클래스 불균형 구조

- 평가 기준
  - **미탐(False Negative) 최소화**
  - Recall 중심 평가

---

## 🧠 모델 설계

### ✅ Baseline 모델
- Logistic Regression
- 해석 가능성 기반 Feature 검증

### ✅ 비교 모델
- Random Forest
- 비선형 패턴 반영

### ✔️ 모델 선택 기준
- 과적합 방지
- 데이터 규모 및 Feature 수 고려
- 경량 모델 사용

---

## 🧪 특징 추출 (Feature Engineering)

- 세션/행동 단위 통계적 Feature 설계
- 단일 요청이 아닌 **행위 패턴 기반 분석**
- 정상 vs 의심 트래픽 간 행동 차이 반영

---

## 📈 실험 결과

### 🔹 Random Forest
- 오탐(False Positive) 최소화
- 보수적인 탐지 성향

### 🔹 Logistic Regression
- 미탐(False Negative) 최소화
- 대부분의 의심 트래픽 탐지
- 일부 오탐은 보안 관점에서 허용 가능

---

## 🏆 최종 모델 선정

> **Logistic Regression**

- 이유:
  - 의심 트래픽 미탐 최소화 (Recall 중심 전략)
  - 보안 시스템 특성상 탐지 우선 전략 적용

---

## 🚀 시스템 적용 결과

- 브라우저 기반 실시간 트래픽 스캔 구현
- 의심 점수 0.8 초과 시 사용자 경고 알림 제공

👉 결과:
- 초기 단계에서 위험 행위 탐지 가능
- 사용자 경고 기반 경량 보안 시스템 구현

---

## ⚠️ 한계점

- Rule 기반 Weak Labeling → 라벨 정확도 한계
- 행위 기반 Feature만 사용 → 정교한 악성코드 식별 한계
- 고정 임계값 → 상황별 대응 어려움

---

## 🔮 향후 개선 방향

- 라벨 품질 개선 (추가 검증 데이터 확보)
- 시계열 기반 모델 적용
- Feature 확장
- 위험도 기반 동적 임계값 적용
