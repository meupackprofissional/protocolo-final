import { Router, Request, Response } from 'express';
import { saveLead } from './supabase';
import { sendLeadEvent, sendTestEvent } from './meta-capi';
import { handleHotmartWebhook, validateHotmartSignature } from './hotmart-webhook';

const router = Router();

/**
 * POST /api/quiz/submit
 * Salvar dados do quiz e enviar evento de Lead para Meta
 */
router.post('/quiz/submit', async (req: Request, res: Response) => {
  try {
    const { email, phone, quizResponses, fbp, fbc } = req.body;

    // Validar dados obrigatórios
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    console.log(`[API] Submitting quiz for email: ${email}`);

    // 1. Salvar lead no Supabase
    const lead = await saveLead({
      email,
      phone,
      quizResponses: quizResponses || {},
      fbp,
      fbc,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    console.log(`[API] Lead saved with ID: ${lead.id}`);

    // 2. Enviar evento de Lead para Meta
    try {
      const metaResponse = await sendLeadEvent({
        email,
        phone,
        fbp,
        fbc,
        clientIpAddress: req.ip,
        clientUserAgent: req.get('user-agent'),
        quizResponses,
      });

      console.log(`[API] Meta Lead event sent: ${metaResponse.eventId}`);

      return res.status(200).json({
        success: true,
        leadId: lead.id,
        metaEventId: metaResponse.eventId,
        message: 'Quiz submitted successfully',
      });
    } catch (metaError) {
      console.error('[API] Error sending to Meta:', metaError);
      // Retornar sucesso mesmo se Meta falhar
      return res.status(200).json({
        success: true,
        leadId: lead.id,
        message: 'Quiz submitted (Meta tracking failed)',
      });
    }
  } catch (error) {
    console.error('[API] Error submitting quiz:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit quiz',
    });
  }
});

/**
 * POST /api/webhooks/hotmart
 * Receber webhook da Hotmart
 */
router.post('/webhooks/hotmart', async (req: Request, res: Response) => {
  try {
    // Validar assinatura do webhook
    const signature = req.get('x-signature') || req.get('x-hotmart-signature');
    const body = JSON.stringify(req.body);

    if (signature && !validateHotmartSignature(body, signature)) {
      console.warn('[Webhook] Invalid Hotmart signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
      });
    }

    console.log(`[Webhook] Received Hotmart event: ${req.body.event}`);

    // Processar webhook
    const result = await handleHotmartWebhook(req.body);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Webhook] Error processing Hotmart webhook:', error);
    // Retornar 200 mesmo em erro para evitar retry infinito
    return res.status(200).json({
      error: 'Failed to process webhook',
    });
  }
});

/**
 * POST /api/meta/test
 * Testar conexão com Meta CAPI
 */
router.post('/meta/test', async (req: Request, res: Response) => {
  try {
    console.log('[API] Testing Meta CAPI connection');

    const result = await sendTestEvent();

      return res.status(200).json({
        message: 'Meta CAPI test event sent successfully',
        ...result,
      });
  } catch (error) {
    console.error('[API] Error testing Meta CAPI:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send test event to Meta',
    });
  }
});

/**
 * GET /api/health
 * Health check
 */
router.get('/health', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
