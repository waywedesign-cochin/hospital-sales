import axios from 'axios';
import crypto from 'crypto';
import Organization from '../models/Organization';
import { decrypt } from './crypto';
import MessageLog from '../models/MessageLog';

const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface WhatsAppConfig {
  accessToken: string;
  wabaId: string;
  phoneNumberId: string;
}

const getWhatsAppConfig = async (organizationId: string): Promise<WhatsAppConfig> => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new Error('Organization not found');
  if (!org.whatsapp || !org.whatsapp.isActive || !org.whatsapp.accessToken) {
    throw new Error('WhatsApp is not configured or active for this organization');
  }

  const decryptedToken = decrypt(org.whatsapp.accessToken);
  return {
    accessToken: decryptedToken,
    wabaId: org.whatsapp.wabaId,
    phoneNumberId: org.whatsapp.phoneNumberId,
  };
};

export const sendWhatsAppTemplate = async (
  organizationId: string,
  patientPhone: string,
  templateName: string,
  params: string[],
  patientId?: string
) => {
  const config = await getWhatsAppConfig(organizationId);

  // WhatsApp API expects phone numbers without the '+' sign
  const formattedPhone = patientPhone.replace('+', '');

  const payload = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en_US', 
      },
      components: [
        {
          type: 'body',
          parameters: params.map((text) => ({
            type: 'text',
            text: text,
          })),
        },
      ],
    },
  };

  try {
    const response = await axios.post(
      `${META_BASE_URL}/${config.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const metaMessageId = response.data.messages?.[0]?.id;

    // Log the successful send
    await MessageLog.create({
      organizationId,
      recipientPhone: patientPhone,
      patientId,
      messageType: 'BOOKING_CONFIRMATION', 
      content: `Template: ${templateName}`,
      status: 'SENT',
      sentAt: new Date(),
      metaMessageId,
    });

    return response.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error('WhatsApp Template Send Error:', errorDetails);

    // Log the failure
    await MessageLog.create({
      organizationId,
      recipientPhone: patientPhone,
      patientId,
      messageType: 'BOOKING_CONFIRMATION',
      content: `Template: ${templateName}`,
      status: 'FAILED',
      errorDetails,
    });

    throw new Error(`Failed to send WhatsApp template: ${errorDetails}`);
  }
};

export const sendWhatsAppText = async (
  organizationId: string,
  patientPhone: string,
  text: string,
  patientId?: string
) => {
  const config = await getWhatsAppConfig(organizationId);
  const formattedPhone = patientPhone.replace('+', '');

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: text,
    },
  };

  try {
    const response = await axios.post(
      `${META_BASE_URL}/${config.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const metaMessageId = response.data.messages?.[0]?.id;

    await MessageLog.create({
      organizationId,
      recipientPhone: patientPhone,
      patientId,
      messageType: 'MANUAL',
      content: text,
      status: 'SENT',
      sentAt: new Date(),
      metaMessageId,
    });

    return response.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error('WhatsApp Text Send Error:', errorDetails);
    throw new Error(`Failed to send WhatsApp text: ${errorDetails}`);
  }
};

export const submitTemplate = async (organizationId: string, templatePayload: any) => {
  const config = await getWhatsAppConfig(organizationId);

  try {
    const response = await axios.post(
      `${META_BASE_URL}/${config.wabaId}/message_templates`,
      templatePayload,
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    throw new Error(`Failed to submit template: ${errorDetails}`);
  }
};

export const getTemplateStatus = async (organizationId: string, templateName: string) => {
  const config = await getWhatsAppConfig(organizationId);

  try {
    const response = await axios.get(
      `${META_BASE_URL}/${config.wabaId}/message_templates`,
      {
        params: { name: templateName },
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    throw new Error(`Failed to get template status: ${errorDetails}`);
  }
};

export const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error('META_APP_SECRET is not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload, 'utf8')
    .digest('hex');

  const expectedSignatureHeader = `sha256=${expectedSignature}`;
  
  // Safe comparison
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignatureHeader);
  if (a.length !== b.length) return false;
  
  return crypto.timingSafeEqual(a, b);
};
