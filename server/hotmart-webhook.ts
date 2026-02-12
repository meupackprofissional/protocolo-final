import crypto from 'crypto';
import { getLead, savePurchase, updatePurchaseMetaStatus } from './supabase';
import { sendPurchaseEvent } from './meta-capi';

const HOTMART_SECRET = process.env.HOTMART_WEBHOOK_SECRET;

/**
 * Validar assinatura do webhook Hotmart
 */
export function validateHotmartSignature(
  body: string,
  signature: string
): boolean {
  if (!HOTMART_SECRET) {
    console.warn('[Hotmart] Secret not configured, skipping validation');
    return true;
  }

  const hash = crypto
    .createHmac('sha256', HOTMART_SECRET)
    .update(body)
    .digest('hex');

  return hash === signature;
}

/**
 * Interface para dados do webhook Hotmart
 */
interface HotmartWebhookData {
  id: string;
  creation_date: number;
  event: string;
  version: string;
  data: {
    product: {
      id: number;
      ucode: string;
      name: string;
    };
    buyer: {
      email: string;
      name: string;
      first_name: string;
      last_name: string;
      checkout_phone_code: string;
      checkout_phone: string;
      address: {
        city: string;
        country: string;
        country_iso: string;
        state: string;
        neighborhood: string;
        zipcode: string;
        address: string;
        number: string;
        complement: string;
      };
      document: string;
      document_type: string;
    };
    purchase: {
      approved_date: number;
      full_price: {
        value: number;
        currency_value: string;
      };
      price: {
        value: number;
        currency_value: string;
      };
      order_date: number;
      status: string;
      transaction: string;
      payment: {
        installments_number: number;
        type: string;
      };
      offer: {
        code: string;
        coupon_code: string;
      };
    };
  };
}

/**
 * Processar webhook de compra aprovada
 */
export async function handlePurchaseApprovedWebhook(
  webhookData: HotmartWebhookData
) {
  try {
    const { data: hotmartData } = webhookData;
    const email = hotmartData.buyer.email;
    const transactionId = hotmartData.purchase.transaction;

    console.log(`[Hotmart] Processing PURCHASE_APPROVED for email: ${email}`);

    // 1. Buscar dados do lead já salvos
    const lead = await getLead(email);

    if (!lead) {
      console.warn(
        `[Hotmart] Lead not found for email: ${email}, creating new one`
      );
    }

    // 2. Salvar dados de compra
    const purchase = await savePurchase({
      email,
      hotmartTransactionId: transactionId,
      hotmartOrderDate: hotmartData.purchase.order_date,
      hotmartApprovedDate: hotmartData.purchase.approved_date,
      productName: hotmartData.product.name,
      productId: hotmartData.product.ucode,
      value: hotmartData.purchase.price.value,
      currency: hotmartData.purchase.price.currency_value,
      buyerName: hotmartData.buyer.name,
      buyerPhone: hotmartData.buyer.checkout_phone,
      buyerDocument: hotmartData.buyer.document,
      buyerAddress: hotmartData.buyer.address,
      paymentType: hotmartData.purchase.payment.type,
      paymentInstallments: hotmartData.purchase.payment.installments_number,
      hotmartStatus: hotmartData.purchase.status,
      hotmartData,
    });

    console.log(`[Hotmart] Purchase saved with ID: ${purchase.id}`);

    // 3. Enviar evento para Meta CAPI
    try {
      // Recuperar Event ID do lead para correlacionar com Purchase
      const eventId = lead?.event_id;
      
      const metaResponse = await sendPurchaseEvent({
        email,
        phone: hotmartData.buyer.checkout_phone,
        fbp: lead?.fbp,
        fbc: lead?.fbc,
        value: hotmartData.purchase.price.value,
        currency: hotmartData.purchase.price.currency_value,
        productName: hotmartData.product.name,
        productId: hotmartData.product.ucode,
        transactionId,
        eventId, // Usar MESMO Event ID do Lead
        hotmartData,
      });

      console.log(`[Hotmart] Meta CAPI event sent: ${metaResponse.eventId}`);

      // 4. Atualizar status de envio para Meta
      await updatePurchaseMetaStatus(purchase.id, metaResponse.eventId);

      console.log(`[Hotmart] Purchase meta status updated`);
    } catch (metaError) {
      console.error('[Hotmart] Error sending to Meta CAPI:', metaError);
      // Não falhar o webhook se Meta falhar, apenas logar
    }

    return {
      success: true,
      purchaseId: purchase.id,
      message: 'Purchase processed successfully',
    };
  } catch (error) {
    console.error('[Hotmart] Error processing webhook:', error);
    throw error;
  }
}

/**
 * Processar webhook genérico
 */
export async function handleHotmartWebhook(webhookData: HotmartWebhookData) {
  const { event } = webhookData;

  console.log(`[Hotmart] Received webhook event: ${event}`);

  switch (event) {
    case 'PURCHASE_APPROVED':
      return handlePurchaseApprovedWebhook(webhookData);

    case 'PURCHASE_COMPLETED':
      console.log('[Hotmart] PURCHASE_COMPLETED event received');
      return { success: true, message: 'Purchase completed' };

    case 'PURCHASE_REFUNDED':
      console.log('[Hotmart] PURCHASE_REFUNDED event received');
      return { success: true, message: 'Purchase refunded' };

    case 'CHARGEBACK':
      console.log('[Hotmart] CHARGEBACK event received');
      return { success: true, message: 'Chargeback received' };

    case 'ABANDONED_CART':
      console.log('[Hotmart] ABANDONED_CART event received');
      return { success: true, message: 'Abandoned cart' };

    case 'PAYMENT_PENDING':
      console.log('[Hotmart] PAYMENT_PENDING event received');
      return { success: true, message: 'Payment pending' };

    default:
      console.warn(`[Hotmart] Unknown event: ${event}`);
      return { success: true, message: 'Event received' };
  }
}
