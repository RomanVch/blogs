import {emailAdapter} from "../adapterts/email-adapter";

const messages = {
  confirmRegistration (code:string) {return `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href=https://somesite.com/confirm-email?code=${code}>complete registration</a>
      </p>`}
}

const subjects = {
    confirmRegistration:'Confirm Registration'
}

export const emailManager = {
  sendConfirmationEmail (email: string,confirmationCode: string) {
   return  emailAdapter.sendEmail(email,messages.confirmRegistration(confirmationCode),subjects.confirmRegistration);
  },
};