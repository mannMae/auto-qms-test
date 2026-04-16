import { execSync } from 'child_process';
import path from 'path';
import generatePDF from './generate-pdf.js';
import fs from 'fs-extra';
import matter from 'gray-matter';

let DOCS_DIR = process.argv[2] || 'docs';
let REFERENCES_DIR = process.argv[3] || 'references';
let OUTPUT_DIR = process.argv[4] || 'output';
let VERSION_FILE = process.argv[5] || path.join(DOCS_DIR, 'versions.json');

// Ensure directories are relative to current workspace if they aren't absolute
if (!path.isAbsolute(DOCS_DIR)) DOCS_DIR = path.resolve(process.cwd(), DOCS_DIR);
if (!path.isAbsolute(REFERENCES_DIR)) REFERENCES_DIR = path.resolve(process.cwd(), REFERENCES_DIR);
if (!path.isAbsolute(OUTPUT_DIR)) OUTPUT_DIR = path.resolve(process.cwd(), OUTPUT_DIR);
if (!path.isAbsolute(VERSION_FILE)) VERSION_FILE = path.resolve(process.cwd(), VERSION_FILE);

async function getNextVersion(fileName, vFromMd) {
    let versions = {};
    if (await fs.pathExists(VERSION_FILE)) {
        versions = await fs.readJson(VERSION_FILE);
    }

    const entry = versions[fileName] || { history: [] };
    const latest = entry.history[entry.history.length - 1] || { v: 0, minor: -1 };
    
    let newV = vFromMd || latest.v;
    let newMinor = 0;

    if (newV === latest.v) {
        newMinor = latest.minor + 1;
    } else {
        newMinor = 0; 
    }

    const nextVer = `${newV}.${newMinor}`;
    const today = new Date().toISOString().split('T')[0];

    // Add to history
    entry.history.push({
        v: newV,
        minor: newMinor,
        version: nextVer,
        date: today,
        reason: "Content updated via CI",
        author: "Antigravity AI" // CI에서 업데이트할 때 작성자 이름을 명시적으로 설정
    });

    versions[fileName] = entry;
    await fs.writeJson(VERSION_FILE, versions, { spaces: 2 });
    
    return {
        nextVer,
        history: entry.history
    };
}

async function run() {
    try {
        console.log('--- CI Selective Update & Auto Versioning ---');
        
        // 1. Detect changes
        let changedFiles = [];
        let newReferences = [];
        try {
            // In GitHub Actions, we often want to compare HEAD with the previous commit
            const diffOutput = execSync('git diff --name-only HEAD~1 HEAD').toString();
            const allChanges = diffOutput.split('\n');
            const relativeDocsPath = path.relative(process.cwd(), DOCS_DIR);
            const relativeRefsPath = path.relative(process.cwd(), REFERENCES_DIR);
            
            changedFiles = allChanges.filter(f => f.startsWith(relativeDocsPath) && f.endsWith('.md')).map(f => path.resolve(process.cwd(), f));
            newReferences = allChanges.filter(f => f.startsWith(relativeRefsPath) && f.endsWith('.pdf')).map(f => path.resolve(process.cwd(), f));
        } catch (e) {
            console.log('Falling back to scanning all files due to git error:', e.message);
            if (await fs.pathExists(DOCS_DIR)) {
                const docs = await fs.readdir(DOCS_DIR);
                changedFiles = docs.filter(f => f.endsWith('.md')).map(f => path.join(DOCS_DIR, f));
            }
        }

        // Handle new references -> Generate Drafts
        for (const refPath of newReferences) {
            console.log(`[New Reference Detected] Analyzing: ${refPath}`);
            execSync(`node scripts/auto-draft-template.js "${refPath}"`);
        }

        if (changedFiles.length === 0 && newReferences.length === 0) {
            console.log('No changes detected.');
            return;
        }

        for (const filePath of changedFiles) {
            if (!(await fs.pathExists(filePath))) {
                console.log(`[Skip] File deleted or missing: ${filePath}`);
                continue;
            }
            console.log(`Processing: ${filePath}`);
            
            // Read MD to get Major version
            const contentRaw = await fs.readFile(filePath, 'utf8');
            const { data: frontmatter } = matter(contentRaw);
            
            const fileName = path.basename(filePath);
            const { nextVer, history } = await getNextVersion(fileName, frontmatter.v || 1);

            await generatePDF({
                contentPath: path.resolve(filePath),
                revision: nextVer,
                history: history,
                outputDir: OUTPUT_DIR
            });
        }

        console.log('--- CI Process Finished ---');
    } catch (error) {
        console.error('CI Process Failed:', error);
        process.exit(1);
    }
}

run();
