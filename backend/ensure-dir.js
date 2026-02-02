const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created:', dir);
} else {
    console.log('Exists:', dir);
}
