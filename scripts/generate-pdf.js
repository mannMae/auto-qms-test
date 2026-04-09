import fs from 'fs-extra';
import path from 'path';
import { marked } from 'marked';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getBase64Image(name) {
    const stampDir = path.resolve(__dirname, '../assets/stamps');
    const assetDir = path.resolve(__dirname, '../assets');
    const possiblePaths = [
        path.join(stampDir, `${name}.png`),
        path.join(assetDir, `${name}.png`),
        path.join(assetDir, 'stamp.png')
    ];
    for (const imgPath of possiblePaths) {
        if (await fs.pathExists(imgPath)) {
            const buffer = await fs.readFile(imgPath);
            return `data:image/${path.extname(imgPath).substring(1)};base64,${buffer.toString('base64')}`;
        }
    }
    return null;
}

async function renderSignature(name, isSigned) {
    if (!isSigned) return '<span class="pending">(승인 대기 중)</span>';
    const base64 = await getBase64Image(name);
    return base64 ? `<img src="${base64}" alt="${name} Stamp" class="stamp-img">` : `<div class="fallback-stamp">${name}<br>SIGNED</div>`;
}

async function generatePDF(data) {
    try {
        const templatePath = path.join(__dirname, '../templates/sdp_template.md');
        const contentPath = data.contentPath || path.join(__dirname, '../docs/SDP_content.md');
        
        const templateRaw = await fs.readFile(templatePath, 'utf8');
        const contentRaw = await fs.readFile(contentPath, 'utf8');
        
        // Use gray-matter to separate frontmatter from content
        const { data: frontmatter, content: bodyMarkdown } = matter(contentRaw);
        
        // Merge passed data with frontmatter (frontmatter takes priority if exists)
        const combined = { ...data, ...frontmatter };

        const authorSign = await renderSignature(combined.author, true);
        const reviewerSign = await renderSignature(combined.reviewer, combined.isReviewed);
        const approverSign = await renderSignature(combined.approver, combined.isApproved);

        const replacements = {
            '{{PROJECT_NAME}}': combined.projectName || 'My Project',
            '{{DOC_ID}}': combined.docId || 'DOC-001',
            '{{REVISION}}': combined.revision || '0', // Computed version
            '{{DATE}}': combined.date || new Date().toLocaleDateString(),
            '{{AUTHOR}}': combined.author || 'Author Name',
            '{{REVIEWER}}': combined.reviewer || 'Reviewer Name',
            '{{APPROVER}}': combined.approver || 'Approver Name',
            '{{APPROVE_DATE}}': combined.approveDate || (combined.isApproved ? new Date().toLocaleDateString() : ''),
            '{{AUTHOR_SIGN}}': authorSign,
            '{{REVIEWER_SIGN}}': reviewerSign,
            '{{APPROVER_SIGN}}': approverSign,
            '{{CONTENT}}': bodyMarkdown
        };

        let finalMarkdown = templateRaw;
        for (const [key, value] of Object.entries(replacements)) {
            finalMarkdown = finalMarkdown.split(key).join(value);
        }

        const contentHtml = await marked.parse(finalMarkdown);
        const cssPath = path.join(__dirname, '../templates/style.css');
        const css = await fs.readFile(cssPath, 'utf8');

        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body><div class="pdf-container">${contentHtml}</div></body></html>`;

        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'networkidle' });

        const outputDir = path.join(__dirname, '../output');
        await fs.ensureDir(outputDir);
        const baseName = path.basename(contentPath, '.md');
        const outputPath = path.join(outputDir, `${baseName}.pdf`);
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '2.5cm', bottom: '2.5cm', left: '2cm', right: '2cm' },
            displayHeaderFooter: true,
            headerTemplate: `<div style="font-size: 8px; width: 100%; border-bottom: 0.5px solid #eee; padding: 5px 2cm; display: flex; justify-content: space-between; font-family: sans-serif;"><span>${combined.projectName} - ${combined.docId}</span><span>QMS Official</span></div>`,
            footerTemplate: `<div style="font-size: 8px; width: 100%; border-top: 0.5px solid #eee; padding: 5px 2cm; display: flex; justify-content: space-between; font-family: sans-serif;"><span>Rev: ${combined.revision}</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`
        });

        await browser.close();
        console.log(`[Success] PDF Generated: ${outputPath} (Version: ${combined.revision})`);
        return outputPath;

    } catch (error) {
        console.error('[Error] PDF Generation Failed:', error);
    }
}

if (process.argv[1] === __filename) {
    const targetFile = process.argv[2];
    generatePDF({ contentPath: targetFile ? path.resolve(targetFile) : null, revision: '1.0' });
}

export default generatePDF;
