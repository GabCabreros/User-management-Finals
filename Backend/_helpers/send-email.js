const nodemailer = require('nodemailer');
const config = require('../config.json');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    const transporter = nodemailer.createTransport(config.smtpOptions);
    
    // Send email
    const info = await transporter.sendMail({ 
        from, 
        to, 
        subject, 
        html 
    });
    
    // Log message URL for Ethereal accounts
    if (config.smtpOptions.host.includes('ethereal.email')) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
}
