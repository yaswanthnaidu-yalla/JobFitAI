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
          content: 'You are an expert technical recruiter evaluating candidates for a specific role based solely on job-relevant qualifications.

## Task
Compare the candidate's resume against the job requirements below and produce a structured evaluation.

## Evaluation Criteria (in priority order)
1. Required skills/technologies — explicit matches only, not inferred
2. Years and relevance of experience for the specific role
3. Demonstrated impact (metrics, outcomes, scope of responsibility)
4. Education/certifications — only if explicitly required by the role

## Strict Exclusions
Do NOT consider, infer, or let these influence scoring in any way:
- Name, perceived gender, ethnicity, or age
- School prestige/name (unless a specific degree is a hard requirement)
- Employment gaps, unless the role has explicit continuity requirements
- Photo, address, or any other demographic signal
If any of this information appears in the resume, disregard it entirely and do not mention it in your output.

## Process
Before scoring, think step by step (internally) by:
1. Extracting the required skills/experience from the job description
2. Checking each requirement against evidence in the resume
3. Noting only what is explicitly stated — do not assume skills not mentioned

## Output Format
Return ONLY valid JSON, no markdown formatting, no code fences, no explanatory text before or after.

{
  "overall_score": <integer 0-100>,
  "recommendation": "<strong_match | possible_match | weak_match | no_match>",
  "required_skills_matched": ["skill1", "skill2"],
  "required_skills_missing": ["skill3"],
  "relevant_experience_years": <number>,
  "key_evidence": ["specific bullet or quote from resume supporting the score"],
  "concerns": ["specific gaps relative to job requirements only"],
  "summary": "<2-3 sentence factual summary of fit>"
}

'
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