import nodemailer from 'nodemailer';
import _debug from 'debug';

const debug = _debug('yamp:sendmail');

function emailBody(meetingLink) {
  return `Hello stranger,\n\n
    You have been invited to a meeting.\n
    Please visit the following link and see what is all about:\n
    ${meetingLink}\n\n
    Kind regards,\n
    YAMP team.`;
}

function sendEmailInvitation(meetingLink, recipientEmail) {
    // create and configure transport
  const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    auth: {
      user: process.env.NODEMAILER_USER, // account used to send emails
      pass: process.env.NODEMAILER_PASS, // account password
    },
  });

  const mailOptions = {
    from: 'mailforyamp@gmail.com',
    to: recipientEmail,
    subject: 'YAMP Invitation',
    text: emailBody(meetingLink),
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      debug(error);
    } else {
      debug(`Message sent: ${recipientEmail}`);
    }
  });
}

export default sendEmailInvitation;
