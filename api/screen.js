export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { jobDescription, resumeText } = req.body

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR screener. Evaluate candidates on skills and experience only. Ignore name, gender, age, school, or any demographic signals. Return ONLY valid JSON, no markdown, no extra text.'
        },
        {
          role: 'user',
          content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nReturn JSON: { "name": string, "match_score": number 0-100, "summary": [3 strings], "skills_matched": [strings], "skills_missing": [strings] }`
        }
      ]
    })
  })

  const data = await response.json()
  const result = JSON.parse(data.choices[0].message.content)
  res.status(200).json(result)
}