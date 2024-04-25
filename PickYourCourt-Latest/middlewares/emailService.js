// Import the Nodemailer library
const nodemailer = require('nodemailer');

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use SSL
  auth: {
    user: 'UNCCitcs6112@gmail.com',
    pass: 'urdb wmqr tgwv dodo',
  }
});

// Email data
const sendEmail = (to, subject, htmlContent) => {
    const mailOptions = {
      from: 'UNCCitcs6112@gmail.com', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: htmlContent // html body
    };
  
    transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        console.log(err)
      else
        console.log(info);
    });
  }
  
  module.exports = sendEmail;