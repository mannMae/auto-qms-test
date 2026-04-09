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
