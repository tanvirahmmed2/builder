import { BrevoClient } from '@getbrevo/brevo';
import {
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME,
} from './secret.js';

export const brevo = new BrevoClient({
  apiKey: BREVO_API_KEY,
});

export const sendEmail = async ({ to, subject, html, text }) => {
  return await brevo.transactionalEmails.sendTransacEmail({
    sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to: typeof to === 'string' ? [{ email: to }] : to,
    subject,
    htmlContent: html,
    textContent: text,
  });
};

export default brevo;
