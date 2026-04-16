# Auto-QMS 사용 가이드 (For Other Projects)

이 가이드는 다른 프로젝트에서 **Auto-QMS GitHub Action**을 호출하여 문서 자동화 체계를 구축하는 방법을 설명합니다.

---

## 🚀 1. 빠른 시작 (Quick Start)

사용 중인 프로젝트의 레포지토리에 `.github/workflows/qms-automation.yml` 파일을 생성하고 아래 내용을 복사하여 붙여넣으세요.

```yaml
name: QMS Document Automation

on:
  push:
    branches: [ main, master, test ]
    paths:
      - 'docs/**'      # docs 폴더 내부의 마크다운이 변경될 때만 실행

jobs:
  qms-process:
    runs-on: ubuntu-latest
    # [필수] 자동 업데이트된 문서를 다시 커밋하려면 쓰기 권한이 필요합니다.
    permissions:
      contents: write
      
    steps:
      # 1. 대상 프로젝트 코드 체크아웃 (LFS 지원 포함)
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          lfs: true
          fetch-depth: 0 # 버전 및 히스토리 차이 분석을 위해 필수

      # 2. Auto-QMS 액션 실행
      - name: Generate QMS Documents
        uses: mannMae/auto-qms-test@main
        with:
          docs_dir: 'docs'               # 마크다운 파일 위치
          output_dir: 'output'           # PDF가 저장될 위치
          version_file: 'docs/versions.json'

      # 3. 생성된 PDF 및 버전 정보를 프로젝트에 커밋
      - name: Commit & Push Changes
        run: |
          if [ -n "$(git status --porcelain)" ]; then
            git config --local user.email "action@github.com"
            git config --local user.name "GitHub Action [Auto-QMS]"
            git add . # 모든 변경사항(PDF, 버전 JSON 등) 추가
            git commit -m "docs: auto-update QMS versions and PDFs [skip ci]"
            git push
          fi

      # 4. [옵션] 최신 배포본을 GitHub Release로 관리
      - name: Create or Update Latest Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: latest
          name: "Latest QMS Documents"
          files: output/*.pdf
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
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
2. **LFS 지원**: PDF 파일이 많아질 경우 저장소 용량 관리를 위해 [Git LFS](https://git-lfs.github.com/)를 활성화하고 워크플로우 체크아웃 시 `lfs: true` 옵션을 사용하세요.
3. **최신 Release**: `latest` 태그를 활용한 Release 구성을 통해 팀원들이 최신 문서를 항상 동일한 URL에서 받을 수 있게 하세요.
4. **유연한 파일 처리**: 특정 문서에 대한 템플릿이 없거나 파일이 삭제된 경우, 에러로 중단되지 않고 해당 항목만 건너뛰고 다음 작업을 진행합니다.

---

## 🛠️ 5. 트러블슈팅 (Troubleshooting)

### Q1. Push 중 `403 Forbidden` 에러가 발생합니다.
**원인**: GitHub Action의 `GITHUB_TOKEN`에 쓰기 권한이 없습니다.
**해결**: `jobs` 섹션에 아래 권한 설정을 추가하세요.
```yaml
permissions:
  contents: write
```

### Q2. `PDF Generation Failed: browserType.launch` 에러가 발생합니다.
**원인**: Docker 이미지 내부의 Playwright 버전과 `package.json`의 버전이 일치하지 않아 바이너리를 찾지 못하는 경우입니다.
**해결**: 액션 제작자의 경우 리포지토리의 `Dockerfile` 내 `FROM` 이미지를 최신 버전(예: `v1.59.1-noble`)으로 업데이트해야 합니다.

### Q3. `Could not access 'HEAD~1'` 에러가 납니다.
**원인**: 첫 번째 커밋이거나 얕은 체크아웃(`fetch-depth: 1`)을 사용한 경우입니다.
**해결**: `actions/checkout` 단계에서 `fetch-depth: 0`을 설정하세요. 설정 후에도 첫 커밋에서만 발생하는 현상은 무시해도 좋으며(자동으로 전수 조사가 수행됨), 이후 커밋부터는 정상적으로 차이점만 분석하게 됩니다.
