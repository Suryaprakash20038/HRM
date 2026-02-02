const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

console.log("Checking .env at:", envPath);
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log("File content length:", content.length);
    const lines = content.split('\n');
    console.log("First 50 chars (hex):", Buffer.from(content.substring(0, 50)).toString('hex'));
    console.log("First line:", lines[0]);

    lines.forEach((line, i) => {
        if (line.includes('GROQ_API_KEY')) {
            console.log(`Line ${i + 1} (GROQ):`, line.substring(0, 20) + "...");
        }
        if (line.includes('MONGODB_URI')) {
            console.log(`Line ${i + 1} (MONGO):`, line.substring(0, 20) + "...");
        }
    });
} else {
    console.log("File not found!");
}

require('dotenv').config();
const Groq = require('groq-sdk');

console.log("--- DEBUG INFO ---");
console.log("CWD:", process.cwd());
console.log("GROQ_API_KEY from env:", process.env.GROQ_API_KEY ? "FOUND" : "MISSING");
if (process.env.GROQ_API_KEY) {
    console.log("Key Length:", process.env.GROQ_API_KEY.length);
    console.log("Key Start:", process.env.GROQ_API_KEY.substring(0, 5));
    console.log("Key End:", process.env.GROQ_API_KEY.substring(process.env.GROQ_API_KEY.length - 5));
    console.log("Is there whitespace?", /\s/.test(process.env.GROQ_API_KEY) ? "YES" : "NO");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
    try {
        console.log("Attempting API call...");
        await groq.chat.completions.create({
            messages: [{ role: "user", content: "hi" }],
            model: "llama-3.1-70b-versatile",
        });
        console.log("✅ API Call SUCCESS");
    } catch (e) {
        console.log("❌ API Call FAILED:", e.message);
        if (e.error) console.log("Error details:", JSON.stringify(e.error));
    }
}

test();
