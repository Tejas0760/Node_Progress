const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        logger: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: 'Tejas Choudhary <tejaschaudhary883@gmail.com>',
        to: options.user,
        subject: options.subject,
        text: options.message,
    };

    try {
        //this is sendMail here not sendEmail
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error(err);
    }
};

module.exports = sendEmail;
