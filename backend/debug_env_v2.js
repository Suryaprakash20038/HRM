require('dotenv').config();
const path = require('path');
const fs = require('fs');

console.log("Current Directory:", process.cwd());
console.log("Env file path:", path.resolve(process.cwd(), '.env'));
console.log("Does .env exist?", fs.existsSync(path.resolve(process.cwd(), '.env')));

try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
    console.log("Raw .env content length:", envContent.length);
    console.log("Does it contain GROQ_API_KEY?", envContent.includes('GROQ_API_KEY'));

    // Manual parse
    const lines = envContent.split('\n');
    const groqLine = lines.find(l => l.startsWith('GROQ_API_KEY'));
    console.log("GROQ Line found:", groqLine ? "Yes" : "No");
    if (groqLine) {
        console.log("GROQ Key Value (starts with):", groqLine.split('=')[1].trim().substring(0, 5));
    }
} catch (e) {
    console.log("Error reading .env:", e);
}

console.log("process.env.GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Present" : "Missing");
if (process.env.GROQ_API_KEY) {
    console.log("Key length:", process.env.GROQ_API_KEY.length);
}
