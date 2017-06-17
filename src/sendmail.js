import nodemailer from 'nodemailer';

function sendEmailInvitation(meeting_link, recipient_email) {
    // create and configure transport
    var transporter = nodemailer.createTransport({
        service: process.env.NODEMAILER_SERVICE,
        auth: {
            user: process.env.NODEMAILER_USER, // account used to send emails
            pass: process.env.NODEMAILER_PASS // account password
        }
    });

    var mailOptions = {
        from: 'mailforyamp@gmail.com', 
        to: recipient_email, 
        subject: 'YAMP Invitation', 
        text: emailBody(meeting_link) 
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + recipient_email);
        };
    });
}

function emailBody(meeting_link){
    return `Hello stranger,\n\n
    You have been invited to a meeting.\n
    Please visit the following link and see what is all about:\n
    ${meeting_link}\n\n
    Kind regards,\n
    YAMP team.`;
}

export default sendEmailInvitation;
