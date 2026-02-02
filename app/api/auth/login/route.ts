import { NextResponse } from 'next/server';
import { checkPassword, getAuthToken, getCookieName, getCookieMaxAge } from '@/lib/auth';

// Segurança: nunca fazer console.log, log ou armazenar a senha em nenhum lugar.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body.password === 'string' ? body.password.trim() : '';
    if (!password) {
      return NextResponse.json({ error: 'Senha obrigatória' }, { status: 400 });
    }
    if (!checkPassword(password)) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }
    const token = getAuthToken(password);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getCookieMaxAge(),
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Erro ao processar login' }, { status: 500 });
  }
}
