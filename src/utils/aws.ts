import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import fs from 'fs'
import path from 'path'
import { envConfigs } from '~/constants/config'

// Create SES service object.
const sesClient = new SESClient({
  region: envConfigs.AWS_REGION,
  credentials: {
    secretAccessKey: envConfigs.AWS_SECRET_ACCESS_KEY,
    accessKeyId: envConfigs.AWS_ACCESS_KEY_ID
  }
})

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/template-formats/verify-email.html'), 'utf-8')

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

export const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfigs.SES_FROM_ADDRESS,
    toAddresses: toAddress,
    body,
    subject
  })
  return sesClient.send(sendEmailCommand)
}

export const sendRegisterEmail = (
  toAddress: string,
  email_verify_token: string,
  template: string = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email address',
    template
      .replace('[title]', `Please verify your email address`)
      .replace('[content]', `Click the button below to verify your email address.`)
      .replace('[link]', `${envConfigs.CLIENT_URL}/verify-email?email_verify_token=${email_verify_token}`)
      .replace('[button]', `Verify email address`)
  )
}

export const sendForgotPasswordEmail = (
  toAddress: string,
  forgot_password_token: string,
  template: string = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'Verify forgot password email',
    template
      .replace('[link]', `${envConfigs.CLIENT_URL}/verify-email?forgot_password_token=${forgot_password_token}`)
      .replace('[title]', `Please verify your forgot password email address`)
      .replace('[content]', `Click the button below to verify your forgot password email address.`)
      .replace('[button]', `Verify your forgot password.`)
  )
}
