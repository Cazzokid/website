const nodemailer = require("nodemailer");

async function sendEmail(userEmail, link) {
    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
            user: "Cassofluhr@hotmail.com",
            pass: "xsmtpsib-86ed206c3d610cff946828400f14968b8f7cff90dee8ad224f4fcd5df4532f59-sM4vfyQw7C0n3Jp6",
        },
    });

    const mailOptions = {
        from: 'noreply@ProjektPulse.com',
        to: userEmail,
        subject: "Password Choice.",
        html: `<h1>Click <a href="${link}">here</a> to choose your password.</h1>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Message sent to ${userEmail}: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = sendEmail;