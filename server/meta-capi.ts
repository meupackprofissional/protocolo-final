import crypto from 'crypto';
import axios from 'axios';

const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || process.env.VITE_FACEBOOK_PIXEL_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const API_VERSION = 'v24.0';

/**
 * Hash SHA-256 para dados do usuário
 */
export function hashData(data: string): string {
  if (!data) return '';
  return crypto
    .createHash('sha256')
    .update(data.toLowerCase().trim())
    .digest('hex');
}

/**
 * Interface para evento de conversão
 */
interface ConversionEvent {
  eventName: 'Lead' | 'Purchase';
  email: string;
  phone?: string;
  value?: number;
  currency?: string;
  customData?: Record<string, any>;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

/**
 * Enviar evento para Meta Conversions API
 */
export async function sendToMetaCAPI(event: ConversionEvent) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    throw new Error('Meta credentials are not configured');
  }

  try {
    // Preparar dados do usuário com hash
    const userData: Record<string, any> = {};

    if (event.email) {
      userData.em = [hashData(event.email)];
    }

    if (event.phone) {
      userData.ph = [hashData(event.phone)];
    }

    if (event.fbp) {
      userData.fbp = event.fbp;
    }

    if (event.fbc) {
      userData.fbc = event.fbc;
    }

    if (event.clientIpAddress) {
      userData.client_ip_address = event.clientIpAddress;
    }

    if (event.clientUserAgent) {
      userData.client_user_agent = event.clientUserAgent;
    }

    // Preparar dados customizados
    const customData: Record<string, any> = {
      currency: event.currency || 'BRL',
    };

    if (event.value !== undefined) {
      customData.value = event.value;
    }

    if (event.customData) {
      Object.assign(customData, event.customData);
    }

    // Montar payload
    const payload = {
      data: [
        {
          event_name: event.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: `${event.eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          action_source: 'website',
          event_source_url: event.eventSourceUrl || 'https://seuquiz.com.br',
          user_data: userData,
          custom_data: customData,
          opt_out: false,
        },
      ],
    };

    // Enviar para Meta
    const endpoint = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Meta CAPI] ${event.eventName} event sent successfully:`, response.data);

    return {
      success: true,
      eventId: payload.data[0].event_id,
      response: response.data,
    };
  } catch (error) {
    console.error(`[Meta CAPI] Error sending ${event.eventName} event:`, error);
    throw error;
  }
}

/**
 * Enviar evento de Lead (quiz completo)
 */
export async function sendLeadEvent(data: {
  email: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  quizResponses?: Record<string, any>;
}) {
  return sendToMetaCAPI({
    eventName: 'Lead',
    email: data.email,
    phone: data.phone,
    value: 0,
    currency: 'BRL',
    fbp: data.fbp,
    fbc: data.fbc,
    clientIpAddress: data.clientIpAddress,
    clientUserAgent: data.clientUserAgent,
    customData: {
      content_name: 'Quiz - Sono do Bebê',
      content_type: 'lead_form',
      ...data.quizResponses,
    },
    eventSourceUrl: 'https://seuquiz.com.br/quiz/results',
  });
}

/**
 * Enviar evento de Purchase (compra aprovada)
 */
export async function sendPurchaseEvent(data: {
  email: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  value: number;
  currency: string;
  productName: string;
  productId: string;
  transactionId: string;
  hotmartData?: Record<string, any>;
}) {
  return sendToMetaCAPI({
    eventName: 'Purchase',
    email: data.email,
    phone: data.phone,
    value: data.value,
    currency: data.currency,
    fbp: data.fbp,
    fbc: data.fbc,
    clientIpAddress: data.clientIpAddress,
    clientUserAgent: data.clientUserAgent,
    customData: {
      content_ids: [data.productId],
      content_name: data.productName,
      content_type: 'product',
      num_items: 1,
      status: 'completed',
      transaction_id: data.transactionId,
    },
    eventSourceUrl: 'https://seuquiz.com.br/checkout/success',
  });
}

/**
 * Enviar evento de teste (para validação)
 */
export async function sendTestEvent() {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    throw new Error('Meta credentials are not configured');
  }

  try {
    const payload = {
      data: [
        {
          event_name: 'ViewContent',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            client_ip_address: '0.0.0.0',
            client_user_agent: 'test-agent',
          },
        },
      ],
    };

    const endpoint = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const response = await axios.post(endpoint, payload);

    console.log('[Meta CAPI] Test event sent successfully:', response.data);

    return {
      success: true,
      response: response.data,
    };
  } catch (error) {
    console.error('[Meta CAPI] Error sending test event:', error);
    throw error;
  }
}
