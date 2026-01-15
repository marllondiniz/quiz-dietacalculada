/**
 * Helper para salvar progresso do quiz progressivamente no Google Sheets
 */

/**
 * Salva progresso do quiz progressivamente
 */
export async function saveQuizProgress(
  leadId: string,
  answers: Record<string, any>,
  step: number,
  trackingData?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    referrer?: string;
    landingPage?: string;
    userAgent?: string;
  }
): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/sheets/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId,
        answers,
        step,
        trackingData,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ Progresso salvo - Step ${step}, Lead ID: ${leadId}`, {
        rowIndex: result.rowIndex,
        updatesCount: result.updatesCount,
      });
    } else {
      console.error('❌ API retornou erro:', result);
    }
    return result;
  } catch (error) {
    console.error('❌ Erro ao salvar progresso:', error);
    return { success: false };
  }
}
