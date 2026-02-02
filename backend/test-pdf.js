const pdf = require('pdf-parse');
const fs = require('fs');

console.log('Type of pdf export:', typeof pdf);
console.log('Keys:', Object.keys(pdf));
console.log('Export:', pdf); // Should be 'function'

async function test() {
    try {
        // Create a dummy PDF buffer (simplest valid PDF header)
        // This won't parse correctly as text but should trigger the function
        const buffer = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000110 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF');

        console.log('Calling pdf-parse...');
        const data = await pdf(buffer);
        console.log('Parsed text:', data.text);
    } catch (e) {
        console.log('Error calling pdf:', e);
    }
}

test();
