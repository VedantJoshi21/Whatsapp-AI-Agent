import { logger } from './logger';

/*{
    Function Name: sendWhatsAppMessage
    Purpose: Sends a text message via WhatsApp Cloud API
    Parameters: phoneNumberId (string), accessToken (string), to (string), text (string)
    Returns: Promise<any>
}*/
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
) {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: { body: text },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    logger.error('WhatsApp API Error', data);
    throw new Error(data.error?.message || 'Failed to send WhatsApp message');
  }

  return data;
}
