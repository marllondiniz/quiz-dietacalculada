'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Redireciona /quiz-v2/[step] para /v2/[step].
 */
export default function QuizV2StepRedirect() {
  const router = useRouter();
  const params = useParams();
  const step = params.step as string;
  useEffect(() => {
    router.replace(`/v2/${step}`);
  }, [router, step]);
  return null;
}
