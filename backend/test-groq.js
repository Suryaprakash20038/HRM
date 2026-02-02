const path = require('path');
const envPath = path.resolve(__dirname, '.env');
const result = require('dotenv').config({ path: envPath });

console.log("Loading .env from:", envPath);
if (result.error) {
    console.log("❌ Error loading .env:", result.error.message);
} else {
    console.log("✅ .env loaded.");
}

console.log("GROQ_API_KEY present?", !!process.env.GROQ_API_KEY);
if (process.env.GROQ_API_KEY) {
    console.log("Key length:", process.env.GROQ_API_KEY.length);
    console.log("Key starts with:", process.env.GROQ_API_KEY.substring(0, 4));
}

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    try {
        console.log("Testing Groq API connection...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say 'System Operational' if you can hear me." }],
            model: "llama-3.1-70b-versatile",
        });
        console.log("✅ API Test Passed!");
        console.log("🤖 AI Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ API Test Failed:", error.message);
        if (error.status === 401) console.error("Reason: Invalid API Key");
    }
}

main();
