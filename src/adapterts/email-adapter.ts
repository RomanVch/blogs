import nodeMailer from 'nodemailer';

export const emailAdapter = {
   async sendEmail (email:string,message:string,subject:string) {
       try  {
           const transport = nodeMailer.createTransport({
               service: 'gmail',
               auth: {
                   user: "romanvmailer@gmail.com",
                   pass: process.env.PASS_EMAIL||"",
               },
           });
           const info = await transport.sendMail({
               from: "BlogsRegistration<romanvmailer@gmail.com>",
               to: email,
               subject: subject,
               html:message
           })
           return !!info
       } catch (e) {
           console.error(e)
           return false
       }
    }
}