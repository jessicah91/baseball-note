module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const text = String(body.text || '').trim();
    if (!text) {
      res.status(200).json({ softened: '' });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const softened = text
        .replace(/개?새끼|씨발|시발|좆|병신|꺼져|미친놈|미친년|존나|ㅈㄴ|개빡치/g, '많이')
        .replace(/망했/g, '아쉬웠')
        .replace(/못하/g, '쉽지 않')
        .replace(/열받/g, '답답했')
        .replace(/짜증/g, '아쉬움');
      res.status(200).json({ softened, mode: 'local' });
      return;
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: '한국어 야구 다이어리 편집기다. 욕설과 과한 감정 표현을 완전히 지우지 말고, 감정은 남기되 공격적 표현만 부드럽게 바꿔라. 결과는 2~4문장, 160자 이내, 자연스러운 회고문으로 써라.'
              }
            ]
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text }]
          }
        ]
      })
    });

    const data = await response.json();
    const softened = data.output_text || data.output?.map(o => o?.content?.map(c => c.text).join('')).join('\n') || text;
    res.status(200).json({ softened, mode: 'gpt' });
  } catch (error) {
    res.status(200).json({ softened: '조금 거칠었던 마음을 정리하면, 오늘 경기는 기대만큼 풀리지 않아 아쉬움이 크게 남았다. 그래도 어떤 장면이 특히 답답했는지 차분히 남겨보면 다음 기록이 더 또렷해질 것 같다.', mode: 'fallback', error: error.message });
  }
};
