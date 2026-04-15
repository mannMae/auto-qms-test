# Auto-QMS 사용 가이드 (For Other Projects)

이 가이드는 다른 프로젝트에서 **Auto-QMS GitHub Action**을 호출하여 문서 자동화 체계를 구축하는 방법을 설명합니다.

---

## 🚀 1. 빠른 시작 (Quick Start)

사용 중인 프로젝트의 레포지토리에 `.github/workflows/qms-automation.yml` 파일을 생성하고 아래 내용을 복사하여 붙여넣으세요.

```yaml
name: QMS Document Automation

on:
  push:
    branches: [ main, master ]
    paths:
      - 'docs/**'      # docs 폴더 내부의 마크다운이 변경될 때만 실행

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. 대상 프로젝트 코드 체크아웃
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 버전 비교를 위해 히스토리 전체 필요

      # 2. Auto-QMS 액션 실행
      - name: Generate QMS Documents
        uses: mannMae/auto-qms-test@main  # 작성하신 액션 레포지토리 주소
        with:
          docs_dir: 'docs'               # 마크다운 파일 위치
          output_dir: 'dist/qms-pdfs'    # PDF가 저장될 위치 (자동 생성됨)
          version_file: 'docs/versions.json'

      # 3. 생성된 PDF 및 버전 정보를 프로젝트에 커밋
      - name: Commit & Push Changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action [Auto-QMS]"
          git add .
          git commit -m "docs: Auto-generate QMS PDFs and update versions [skip ci]" || echo "No changes to commit"
          git push
```

---

## ⚙️ 2. 입력 파라미터 (Inputs)

액션 호출 시 `with:` 구문을 통해 다음 설정들을 커스텀할 수 있습니다.

| 파라미터 | 설명 | 기본값 |
| :--- | :--- | :--- |
| `docs_dir` | 원본 마크다운 파일(`.md`)들이 들어있는 폴더 경로 | `docs` |
| `references_dir` | 참고용 PDF(참조 문서)를 넣는 폴더 경로 | `references` |
| `output_dir` | 생성된 결과물 PDF가 저장될 폴더 경로 | `output` |
| `version_file` | 문서 버전 히스토리를 저장할 JSON 파일 경로 | `docs/versions.json` |

---

## 📝 3. 마크다운 정의 가이드

문서의 메타데이터와 승인 구조는 마크다운 상단의 **Frontmatter**를 통해 제어합니다.

```markdown
---
v: 1                     # Major 버전 (1.x)
docId: "SDP-2024-001"    # 관리 번호
projectName: "AI Diagnostic Tool"
author: "홍길동"
reviewer: "이검토"
approver: "최승인"
isApproved: true         # true일 경우 도장이 찍힘
---

# 소프트웨어 개발 계획서 (SDP)
여기서부터 내용을 작성하세요...
```

---

## 📂 4. 디렉토리 구조 예시

대상 프로젝트는 다음과 같은 구조를 권장합니다.

```text
my-project/
├── .github/workflows/
│   └── qms-automation.yml  <-- 위에서 만든 워크플로우 실행 파일
├── docs/
│   ├── SDP_content.md      <-- 마크다운 문서
│   └── versions.json       <-- 자동 생성/업데이트됨 (수정 금지)
└── output/                 <-- 생성된 PDF 결과물 (자동 생성됨)
```

---

## 💡 팁 및 주의사항

1. **[skip ci]**: 자동 커밋 메시지에 `[skip ci]`를 포함하여, 액션에 의한 푸시가 다시 액션을 트리거하는 무한 루프를 방지하세요.
2. **Stamps (도장)**: 서명 이미지는 중앙 액션 레포지토리의 `assets/stamps/` 폴더 내에 `성명.png` 이름으로 저장되어 있어야 자동으로 불러옵니다.
3. **병렬 실행**: 여러 문서가 동시에 바뀌어도 액션은 변경된 모든 파일을 감지하여 일괄 업데이트합니다.
