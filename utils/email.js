const nodemailer = require("nodemailer");

const sendMail = async function (options) {
  //1 create a transporter
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "b627e4c8bf14e9",
      pass: "6c1f7335a623bc",
    },
  });

  // 2 define email options
  const mailOptions = {
    from: "devcamper@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transport.sendMail(mailOptions);
};
module.exports = sendMail;
