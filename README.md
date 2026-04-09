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

### 4. Lifecycle of QMS Document

문서의 생애주기는 설계 단계와 자동화 발행 단계로 나뉩니다.

#### **Phase 0: 템플릿 설계 (Design Time & Auto-Drafting)**
*신규 문서 양식 도입 시 1회 수행*
1. **Reference Input**: 표준 양식 PDF를 `references/` 폴더에 업로드 및 푸시.
2. **Auto Analysis**: CI가 새 파일을 감지하면 `scripts/auto-draft-template.js`가 즉시 실행됨.
3. **Draft Generation**: 시스템이 분석 결과를 바탕으로 `templates/DRAFT_*.md` 초안을 자동 생성하여 저장소에 푸시.
4. **Final Design**: 인간 설계자가 초안을 확인하고 레이아웃 및 스타일(CSS) 보정 후 확정.

#### **Phase 1: 자동 발행 (Run Time / CI)**
*매 Push 또는 PR 머지 시 자동 수행*
1. **Change Detection**: 수정된 `docs/*.md` 또는 `templates/*.md` 파일 감지.
2. **Variable Injection**: 해당 마크다운 세부 내용과 매칭된 템플릿 결합.
3. **Signature Overlay**: `assets/stamps/`의 인장 이미지를 활용해 전자 서명 자동 주입.
4. **Official Release**: 고품질 PDF 생성 후 **GitHub Releases**에 최신 공식 버전으로 등록.

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
