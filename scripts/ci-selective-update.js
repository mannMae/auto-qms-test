import { execSync } from 'child_process';
import path from 'path';
import generatePDF from './generate-pdf.js';
import fs from 'fs-extra';
import matter from 'gray-matter';

const VERSION_FILE = 'docs/versions.json';
const OUTPUT_DIR = 'dist/docs';

async function getNextVersion(fileName, vFromMd) {
    let versions = {};
    if (await fs.pathExists(VERSION_FILE)) {
        versions = await fs.readJson(VERSION_FILE);
    }

    const prev = versions[fileName] || { v: 0, minor: -1 };
    
    let newV = vFromMd || prev.v;
    let newMinor = 0;

    if (newV === prev.v) {
        newMinor = prev.minor + 1;
    } else {
        newMinor = 0; 
    }

    versions[fileName] = { v: newV, minor: newMinor };
    await fs.writeJson(VERSION_FILE, versions, { spaces: 2 });
    
    return `${newV}.${newMinor}`;
}

async function run() {
    try {
        console.log('--- CI Selective Update & Auto Versioning ---');
        
        // 1. Detect changes
        let changedFiles = [];
        try {
            const diffOutput = execSync('git diff --name-only HEAD~1 HEAD').toString();
            changedFiles = diffOutput.split('\n').filter(f => f.startsWith('docs/') && f.endsWith('.md'));
        } catch (e) {
            const docs = await fs.readdir('docs');
            changedFiles = docs.filter(f => f.endsWith('.md')).map(f => path.join('docs', f));
        }

        if (changedFiles.length === 0) {
            console.log('No changed documents detected.');
            return;
        }

        for (const filePath of changedFiles) {
            console.log(`Processing: ${filePath}`);
            
            // Read MD to get Major version
            const contentRaw = await fs.readFile(filePath, 'utf8');
            const { data: frontmatter } = matter(contentRaw);
            
            const fileName = path.basename(filePath);
            const nextVersion = await getNextVersion(fileName, frontmatter.v || 1);

            await generatePDF({
                contentPath: path.resolve(filePath),
                revision: nextVersion
            });
        }

        console.log('--- CI Process Finished ---');
    } catch (error) {
        console.error('CI Process Failed:', error);
        process.exit(1);
    }
}

run();
