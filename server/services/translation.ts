import translate from 'google-translate-api-x';

const fallback: Record<string, string> = {
  'Payment failed. Please use the secure payment link to try again.': 'Payment fail ho gaya. Kripya secure payment link se dobara try karein.'
};

export async function translateRecoveryMessage(text: string, from: string, to: string) {
  if (to === 'hinglish') {
    try {
      const result = await translate(text, { from, to: 'hi' });
      return { text: result.text, language: 'hi', provider: 'google-translate-api-x' };
    } catch {
      return { text: fallback[text] || text, language: 'hinglish', provider: 'deterministic-fallback' };
    }
  }

  if (from === to) return { text, language: to, provider: 'identity' };
  try {
    const result = await translate(text, { from, to });
    return { text: result.text, language: to, provider: 'google-translate-api-x' };
  } catch {
    return { text: fallback[text] || text, language: to, provider: 'deterministic-fallback' };
  }
}