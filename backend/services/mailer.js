//backend/services/mailer.js
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendVerificationCode = async (to, code) => {
  const mailOptions = {
    from: `"EnTalk" <${process.env.MAIL_USER}>`,
    to,
    subject: "Mã xác nhận đăng ký EnTalk",
    text: `Mã xác nhận của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
  };
  await transporter.sendMail(mailOptions);
};

exports.sendNewPasswordEmail = async (to, newPassword) => {
  const mailOptions = {
    from: `"EnTalk" <${process.env.MAIL_USER}>`,
    to,
    subject: "Mật khẩu mới - EnTalk",
    text: `Mật khẩu mới của bạn là: ${newPassword}. Hãy đăng nhập và đổi mật khẩu nếu cần.`,
  };
  await transporter.sendMail(mailOptions);
};
