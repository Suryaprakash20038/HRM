require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('--- Email Configuration Debugger ---');

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;

console.log(`SMTP_USER: '${user}'`);

if (!pass) {
    console.log('❌ SMTP_PASSWORD is MISSING in .env file');
} else {
    // Check for common issues
    const cleanPass = pass.trim();
    if (cleanPass.length !== 16) {
        console.log(`❌ SMTP_PASSWORD length is ${cleanPass.length}. It should be exactly 16 characters for a Google App Password.`);
        console.log('   (Note: If you included spaces, try removing them. If this is your regular login password, it will NOT work.)');
    } else {
        console.log('✅ SMTP_PASSWORD format looks correct (16 characters).');
    }
}

console.log('\nAttempting connection...');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: user,
        pass: pass
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log('\n❌ Connection Failed:');
        console.log(error.message);
        console.log('\nRecommended Action:');
        console.log('1. Go to https://myaccount.google.com/apppasswords');
        console.log('2. Generate a new App Password for "HRM"');
        console.log('3. Copy the 16-character code (remove spaces)');
        console.log('4. Paste it into your .env file as SMTP_PASSWORD');
    } else {
        console.log('\n✅ SUCCESS! Server is ready to send emails.');
    }
});
