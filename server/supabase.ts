import { createClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

// Criar cliente Supabase com Service Role Key (para operações no servidor)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase credentials are not configured');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Salvar dados do lead (quiz completo)
 */
export async function saveLead(data: {
  email: string;
  phone?: string;
  quizResponses: Record<string, any>;
  fbp?: string;
  fbc?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('leads')
      .upsert(
        {
          email: data.email,
          phone: data.phone,
          quiz_responses: data.quizResponses,
          fbp: data.fbp,
          fbc: data.fbc,
          user_agent: data.userAgent,
          ip_address: data.ipAddress,
        },
        { onConflict: 'email' }
      )
      .select();

    if (error) {
      console.error('Error saving lead:', error);
      throw error;
    }

    return result?.[0];
  } catch (error) {
    console.error('Failed to save lead:', error);
    throw error;
  }
}

/**
 * Obter lead pelo email
 */
export async function getLead(email: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Error fetching lead:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch lead:', error);
    throw error;
  }
}

/**
 * Salvar dados de compra (Hotmart webhook)
 */
export async function savePurchase(data: {
  email: string;
  hotmartTransactionId: string;
  hotmartOrderDate: number;
  hotmartApprovedDate: number;
  productName: string;
  productId: string;
  value: number;
  currency: string;
  buyerName: string;
  buyerPhone?: string;
  buyerDocument?: string;
  buyerAddress?: Record<string, any>;
  paymentType: string;
  paymentInstallments?: number;
  hotmartStatus: string;
  hotmartData: Record<string, any>;
}) {
  try {
    const { data: result, error } = await supabase
      .from('purchases')
      .insert({
        email: data.email,
        hotmart_transaction_id: data.hotmartTransactionId,
        hotmart_order_date: data.hotmartOrderDate,
        hotmart_approved_date: data.hotmartApprovedDate,
        product_name: data.productName,
        product_id: data.productId,
        value: data.value,
        currency: data.currency,
        buyer_name: data.buyerName,
        buyer_phone: data.buyerPhone,
        buyer_document: data.buyerDocument,
        buyer_address: data.buyerAddress,
        payment_type: data.paymentType,
        payment_installments: data.paymentInstallments,
        hotmart_status: data.hotmartStatus,
        hotmart_data: data.hotmartData,
      })
      .select();

    if (error) {
      console.error('Error saving purchase:', error);
      throw error;
    }

    return result?.[0];
  } catch (error) {
    console.error('Failed to save purchase:', error);
    throw error;
  }
}

/**
 * Atualizar status de envio para Meta
 */
export async function updatePurchaseMetaStatus(
  purchaseId: string,
  metaEventId: string
) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .update({
        meta_event_id: metaEventId,
        meta_sent: true,
        meta_sent_at: new Date().toISOString(),
      })
      .eq('id', purchaseId)
      .select();

    if (error) {
      console.error('Error updating purchase meta status:', error);
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error('Failed to update purchase meta status:', error);
    throw error;
  }
}

/**
 * Obter compra pelo ID da transação Hotmart
 */
export async function getPurchaseByHotmartId(hotmartTransactionId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('hotmart_transaction_id', hotmartTransactionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching purchase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch purchase:', error);
    throw error;
  }
}
