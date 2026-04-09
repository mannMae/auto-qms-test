import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function analyze() {
    try {
        const dataBuffer = fs.readFileSync('references/reference_sdp.pdf');
        // Let's see if PDFParse takes data buffer. The README showed 'url'.
        // Some libraries take data as well.
        const parser = new PDFParse({ data: dataBuffer });

        const result = await parser.getText();
        console.log("--- PDF CONTENT ---");
        console.log(result.text);
    } catch (err) {
        console.error("Error parsing PDF:", err);
    }
}

analyze();
