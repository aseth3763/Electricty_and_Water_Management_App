const nodemailer = require('nodemailer');
const fs = require('fs');
const htmlPdf = require('html-pdf-node');
const user_bill_Email  = async (recipientEmail, subject, emailcontent , htmlContent) => {
    try {
           // Generate PDF from the HTML 
           const pdfBuffer = await createPDF(emailcontent)

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD,
            },
            tls : {
                rejectUnauthorized:false
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_MAIL,
            to: recipientEmail,
            subject: subject,
            html: htmlContent ,
            attachments: [
                {
                    filename: 'Bill.pdf',
                    content: pdfBuffer,
                    encoding: 'base64',
                    contentType: 'application/pdf'
                }
            ]
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.log(error, 'Email not sent');
    }
};


const createPDF = async(emailcontent)=> {
    try {
           const file = { content : emailcontent}
           const options = { format : 'A4'}

           const pdfBuffer = await htmlPdf.generatePdf(file, options)
           return pdfBuffer
    } catch (error) {
        console.error("error Generating PDF", error);
        throw new Error ('PDF Generation Failed', error.message)
        
    }
}

module.exports = user_bill_Email ;
