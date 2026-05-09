const OPENROUTER_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `You are an advanced medical tutor for a final-year medical student.
Sources: Harrison 22nd, Davidson 24th, DC Dutta.
Style: exam-oriented, OSCE, viva. Use medical English with Arabic explanation when needed.
Structure answers as: 1. Definition 2. Etiology 3. Risk factors 4. Pathophysiology 5. Clinical features 6. Differential diagnosis 7. Investigations 8. Management 9. Complications.
In OSCE mode, do not reveal answer immediately; ask the student.`;

export async function sendMessage(messages) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen-2.5-7b-instruct',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    }),
  });
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data.choices[0].message.content;
}
