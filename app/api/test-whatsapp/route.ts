import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de teste para WhatsApp API
 * 
 * Verifica se as credenciais estão corretas e a API está acessível.
 * 
 * GET/POST /api/test-whatsapp?phone=5511999999999&name=TesteName
 * 
 * Query params:
 * - phone: número do destinatário (com código do país, ex: 5511999999999)
 * - name: nome para usar no template
 * - template: nome do template (opcional, padrão: msg01_recuperacao_quiz_01)
 */
export async function GET(request: NextRequest) {
  return handleTest(request);
}

export async function POST(request: NextRequest) {
  return handleTest(request);
}

async function handleTest(request: NextRequest): Promise<NextResponse> {
  try {
    // Pegar parâmetros
    const phone = request.nextUrl.searchParams.get('phone');
    const name = request.nextUrl.searchParams.get('name');
    const templateName = request.nextUrl.searchParams.get('template') || process.env.WA_RECOVERY_TEMPLATE_NAME || 'msg01_recuperacao_quiz_01';

    if (!phone) {
      return NextResponse.json({
        error: 'Parâmetro "phone" é obrigatório',
        example: '/api/test-whatsapp?phone=5511999999999&name=Teste',
      }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({
        error: 'Parâmetro "name" é obrigatório',
        example: '/api/test-whatsapp?phone=5511999999999&name=Teste',
      }, { status: 400 });
    }

    // Verificar variáveis de ambiente
    const token = process.env.WA_TOKEN;
    const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
    const graphVersion = process.env.GRAPH_VERSION || 'v24.0';

    if (!token || !phoneNumberId) {
      return NextResponse.json({
        error: 'Variáveis de ambiente não configuradas',
        missing: {
          WA_TOKEN: !token,
          WA_PHONE_NUMBER_ID: !phoneNumberId,
        },
      }, { status: 500 });
    }

    // Limpar telefone
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      return NextResponse.json({
        error: 'Número de telefone inválido (muito curto)',
        phone: phone,
        cleaned: cleanPhone,
      }, { status: 400 });
    }

    console.log('📱 [TEST] Testando envio WhatsApp:', {
      to: cleanPhone,
      name,
      template: templateName,
    });

    // Montar payload
    const url = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: name }],
          },
        ],
      },
    };

    // Fazer chamada à API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [TEST] Erro WhatsApp API:', data);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao enviar template',
        status: response.status,
        whatsapp_response: data,
        payload_sent: payload,
        instructions: data?.error?.message?.includes('paused')
          ? 'Template está pausado no WhatsApp. Vá no Meta Business Suite e reative ou crie um novo template.'
          : data?.error?.message?.includes('Template not found')
          ? 'Template não encontrado. Verifique o nome do template no WhatsApp Business Manager.'
          : 'Verifique se o WA_TOKEN não expirou e se o template está aprovado.',
      }, { status: response.ok ? 200 : response.status });
    }

    console.log('✅ [TEST] Mensagem enviada com sucesso:', data);

    return NextResponse.json({
      success: true,
      message: 'Template enviado com sucesso',
      to: cleanPhone,
      name,
      template: templateName,
      whatsapp_response: data,
    });

  } catch (error: any) {
    console.error('❌ [TEST] Erro no teste WhatsApp:', error);

    return NextResponse.json({
      error: 'Erro ao processar teste',
      message: error.message,
    }, { status: 500 });
  }
}
