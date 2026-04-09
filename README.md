# QMS Digital-Auto-Doc 🚀

[![Generate QMS PDF](https://github.com/mannMae/auto-qms-test/actions/workflows/generate-pdf.yml/badge.svg)](https://github.com/mannMae/auto-qms-test/actions/workflows/generate-pdf.yml)

> **"Git 승인이 완료되면 도장이 찍힌 공식 PDF가 생성되는 자동화 체계"**

## 📥 최신 공식 문서 다운로드 (Direct)
CI/CD를 통해 검증되고 인장이 찍힌 최신 PDF 문서를 바로 다운로드하세요.

👉 **[[최신 공식 PDF 직접 다운로드 (Latest Release)]](https://github.com/mannMae/auto-qms-test/releases/latest)**

---

## 📄 문서 확인 방법 (GitHub 환경)
1.  **Direct Download (추천)**: 위 링크의 **Releases** 페이지에서 `Assets` 항목의 PDF 파일을 클릭하여 즉시 다운로드합니다.
2.  **Actions Artifacts**: [Actions](https://github.com/mannMae/auto-qms-test/actions) 탭에서 특정 빌드 기록을 클릭한 후, 최하단의 **Artifacts** 섹션에서 꾸러미를 받을 수 있습니다.

---

## 🏗️ Architecture & Workflows

이 시스템은 **"Code as Documentation"** 철학을 기반으로 설계되었으며, 향후 메인 프로젝트의 **Monorepo (`apps/qms/`)** 환경에 통합되는 것을 전제로 합니다.

### 1. 서비스 통합 아키텍처 (Full-Stack & QMS)
```mermaid
graph LR
    subgraph Monorepo ["Monorepo (Root)"]
        direction TB
        F[apps/frontend]
        B[apps/backend]
        AI[apps/ai-server]
        Q[apps/qms]
    end

    F -- "Develop Spec" --> Q
    B -- "API Spec / Test Logs" --> Q
    AI -- "Algorithm Validation" --> Q

    subgraph QMS_Engine ["QMS Automation Engine"]
        Q -- "Markdown Docs" --> TE(Template Engine)
        TE -- "Puppeteer/Playwright" --> PDF[.pdf Documents]
    end

    PDF -- "Automated Release" --> REL[GitHub Releases]
    REL -- "Official Records" --> AUDIT((Regulatory Audit))
```

### 2. 주요 역할 (Directory Roles)
- **`apps/frontend`, `backend`, `ai-server`**: 실제 서비스 비즈니스 로직을 개발합니다.
- **`apps/qms/docs/`**: 위 서비스들의 개발 과정에서 발생하는 명세서(SDP, SRS), 위험 분석(RM), 테스트 보고서(V&V) 등을 마크다운 형태로 집대성합니다.
- **`apps/qms/templates/`**: 모든 기술 문서를 일관된 인허가 규격 양식으로 변환하기 위한 스타일 가이드를 관리합니다.
- **`apps/qms/scripts/`**: CI/CD 파이프라인과 연동되어 각 서비스 브랜치가 머지될 때마다 최신 기술 문서를 자동으로 PDF로 구워냅니다.

### 3. 모노레포 통합 시 이점
- **일관성**: 모든 앱의 QMS 문서 양식을 하나의 템플릿 엔진으로 통일할 수 있습니다.
- **버전 동기화**: 프로젝트의 릴리스 시점과 문서 발행 시점을 Git Tag를 통해 완벽하게 동기화할 수 있습니다.
- **검증 자동화**: CI에서 문서 하이퍼링크 유효성이나 필수 항목 누락 여부를 자동으로 검사할 수 있습니다.

---

## 1. 프로젝트 개요
의료기기 QMS 문서 자동화 시스템을 위한 실험적 프로젝트입니다. 마크다운으로 작성된 SDP(소프트웨어 개발 계획서)를 승인 로그와 함께 공식적인 PDF로 변환하는 시스템을 구축합니다.

## 2. 핵심 기술 스택
- **Runtime**: Node.js
- **PDF Engine**: Playwright 또는 Puppeteer (Chromium 기반의 고품질 PDF 렌더링)
- **Converter**: Markdown -> HTML -> PDF
- **Styling**: Vanilla CSS (Print Media Query)
- **CI/CD**: GitHub Actions

## 3. 주요 구현 단계 (Milestones)

### 단계 1: 마크다운 템플릿 설계
- **목표**: 의료기기 표준 형식을 갖춘 `sdp_template.md` 작성.
- **포함 사항**: 
    - 표지 (Cover Page)
    - 개정 이력 (Revision History)
    - 서명란 테이블 (Signature Table)
- **기능**: `{{REVISION}}`, `{{DATE}}`, `{{APPROVER}}` 등 변수 치환 로직.

### 단계 4: CI/CD 연동 (GitHub Actions)
- **목표**: Pull Request가 Merge 될 때 자동으로 상기 스크립트를 실행하여 PDF를 생성하고 저장.

## 4. 폴더 구조
```text
.
├── templates/          # Markdown 템플릿 파일
├── docs/               # 실제 작성될 QMS 문서 (Source)
├── scripts/            # PDF 변환 및 승인 로직 스크립트
├── assets/             # 인장 이미지, 로고, 폰트 등
├── output/             # 생성된 PDF 저장 (Git ignore)
├── .github/workflows/  # CI/CD 자동화 정의
├── package.json
└── README.md
```
