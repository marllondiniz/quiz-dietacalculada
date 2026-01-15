import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_PIXEL_ID = '460171273178832';
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_API_VERSION = 'v21.0';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.warn('⚠️ FACEBOOK_ACCESS_TOKEN não configurado. Configure a variável de ambiente para usar a API de Conversões.');
}

interface ConversionData {
  event_name: string;
  event_time: number;
  event_id?: string;
  user_data?: {
    email?: string;
    phone?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook Click ID
    fbp?: string; // Facebook Browser ID
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
  };
  event_source_url?: string;
  action_source?: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_name, user_data, custom_data, event_id, event_source_url } = body;

    if (!event_name) {
      return NextResponse.json(
        { error: 'event_name é obrigatório' },
        { status: 400 }
      );
    }

    // Capturar IP do cliente dos headers
    const clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      user_data?.client_ip_address ||
      undefined;

    // Preparar dados do evento
    const conversionData: ConversionData = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: event_source_url || request.headers.get('referer') || undefined,
      action_source: 'website',
      user_data: {
        ...(user_data?.email && { 
          email: user_data.email 
        }),
        ...(user_data?.phone && { 
          phone: user_data.phone 
        }),
        ...(clientIp && { 
          client_ip_address: clientIp
        }),
        ...(user_data?.client_user_agent && { 
          client_user_agent: user_data.client_user_agent 
        }),
        ...(user_data?.fbc && { 
          fbc: user_data.fbc 
        }),
        ...(user_data?.fbp && { 
          fbp: user_data.fbp 
        }),
      },
      custom_data: custom_data || {},
    };

    // Adicionar event_id se fornecido
    if (event_id) {
      conversionData.event_id = event_id;
    }

    // Fazer requisição para Facebook Conversions API
    const url = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${FACEBOOK_PIXEL_ID}/events`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: FACEBOOK_ACCESS_TOKEN,
        data: [conversionData],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erro na API de Conversões do Facebook:', result);
      return NextResponse.json(
        { 
          error: 'Erro ao enviar conversão',
          details: result.error || result
        },
        { status: response.status }
      );
    }

    console.log('✅ Conversão enviada para Facebook:', {
      event_name,
      events_received: result.events_received,
    });

    return NextResponse.json({
      success: true,
      message: 'Conversão enviada com sucesso',
      result,
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar conversão do Facebook:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar conversão',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
