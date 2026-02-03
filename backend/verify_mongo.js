require('dotenv').config();
const mongoose = require('mongoose');

// Force the URI to be what we see in the file, just in case .env loading is weird
const uri = process.env.MONGODB_URI;

console.log("Testing Connection to:", uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri)
    .then(() => {
        console.log("✅ SUCCESS! Your MongoDB Connection String is CORRECT.");
        console.log("If this works locally but fails on Render, the issue is IP WHITELISTING.");
        process.exit(0);
    })
    .catch((err) => {
        console.log("❌ FAILED! The issue is likely your PASSWORD or USERNAME.");
        console.log("Error Message:", err.message);
        process.exit(1);
    });
