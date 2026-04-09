import fs from 'fs-extra';
import path from 'path';
import pdf from 'pdf-parse';

async function generateDraft(pdfPath) {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdf(dataBuffer);
    
    // 1. Extract basic info
    const fileName = path.basename(pdfPath, '.pdf');
    const lines = data.text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    
    // Guessing Title (usually first few lines)
    const title = lines[0] || fileName;
    
    // Extracting Table of Contents (TOC) - simple heuristic
    const toc = lines.filter(l => /^[0-9](\.[0-9])*/.test(l)).slice(0, 15);

    // 2. Build Markdown Template
    let draftMd = `---
v: 1
docId: QMS-${fileName.toUpperCase().replace(/\-/g, '_')}
projectName: "{{PROJECT_NAME}}"
author: "{{AUTHOR_NAME}}"
reviewer: "{{REVIEWER_NAME}}"
approver: "{{APPROVER_NAME}}"
---

# ${title}

## 0. 승인 기록 (Approval)
| 역할 | 성명 | 서명 | 날짜 |
| :--- | :--- | :--- | :--- |
| 작성 | {{author}} | {{AUTHOR_SIGN}} | {{DATE}} |
| 검토 | {{reviewer}} | {{REVIEWER_SIGN}} | {{DATE}} |
| 승인 | {{approver}} | {{APPROVER_SIGN}} | {{DATE}} |

## 개정 이력 (Revision History)
| 버전 | 날짜 | 개정 사유 | 작성자 |
| :--- | :--- | :--- | :--- |
| {{REVISION}} | {{DATE}} | 최초 작성 | {{author}} |

---

<!-- 자동 분석 결과 기반 목차 (Table of Contents) -->
`;

    if (toc.length > 0) {
        draftMd += "\n## 상세 목차 (TOC)\n";
        toc.forEach(item => {
            draftMd += `- ${item}\n`;
        });
    }

    draftMd += `
---

## 본문 (Content)
{{CONTENT}}

---
<!-- FOOTER -->
[본 문서는 프로젝트 {{projectName}}의 결과물이며, 대외비입니다.]  
Page {{PAGE_NUMBER}} / {{TOTAL_PAGES}}  
Rev: {{REVISION}}
`;

    const outputPath = path.join(process.cwd(), 'templates', `DRAFT_${fileName}.md`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, draftMd);
    
    console.log(`[Success] Draft Template Created: ${outputPath}`);
    
    // Also create a basic content file for testing
    const contentPath = path.join(process.cwd(), 'docs', `${fileName}_content.md`);
    if (!(await fs.pathExists(contentPath))) {
        await fs.writeFile(contentPath, `---
v: 1
template: "DRAFT_${fileName}.md"
---
# ${title} 내용

여기에 마크다운 내용을 입력하세요.
`);
        console.log(`[Success] Content Source Created: ${contentPath}`);
    }
}

const targetPdf = process.argv[2];
if (targetPdf) {
    generateDraft(targetPdf).catch(console.error);
} else {
    console.error("Please provide a PDF path.");
}
