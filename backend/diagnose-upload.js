const fs = require('fs');
const path = require('path');

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

const dest = 'uploads/resumes';
const absPath = path.resolve(process.cwd(), dest);

console.log('Target Path:', absPath);

try {
    if (!fs.existsSync(absPath)) {
        console.log('Path does not exist. Creating...');
        fs.mkdirSync(absPath, { recursive: true });
        console.log('Created.');
    } else {
        console.log('Path exists.');
        const stats = fs.statSync(absPath);
        console.log('Is Directory:', stats.isDirectory());
    }

    const testFile = path.join(absPath, 'test-write.txt');
    fs.writeFileSync(testFile, 'Hello World');
    console.log('Successfully wrote to:', testFile);
    fs.unlinkSync(testFile);
    console.log('Successfully deleted test file');

} catch (e) {
    console.error('ERROR:', e);
}
