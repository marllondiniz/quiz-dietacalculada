'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redireciona /quiz-v2 para /v2 (tela inicial com Continuar).
 */
export default function QuizV2Redirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/v2');
  }, [router]);
  return null;
}
