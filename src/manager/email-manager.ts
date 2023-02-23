import {emailAdapter} from "../adapterts/email-adapter";

const messages = {
  confirmRegistration (code:string) {return `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href=https://somesite.com/confirm-email?code=${code}>complete registration</a>
      </p>`},
    changeCodePassword (code:string) {return ` <h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
      </p>`}
}

const subjects = {
    confirmRegistration:'Confirm Registration',
    recoverPassword:'Recover Password'
}

export const emailManager = {
  sendConfirmationEmail (email: string,confirmationCode: string) {
   return  emailAdapter.sendEmail(email,messages.confirmRegistration(confirmationCode),subjects.confirmRegistration);
  },
    sendRecoveryPaswordCodeEmail (email: string,confirmationCode: string) {
        return  emailAdapter.sendEmail(email,messages.changeCodePassword(confirmationCode),subjects.recoverPassword);
    },
};