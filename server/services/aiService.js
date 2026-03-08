import { GoogleGenAI } from '@google/genai';

const getSystemInstruction = (mode) => {
    switch (mode) {
        case 'coding':
            return `You are a senior software engineer with expertise across multiple languages and frameworks.
When helping with code:
- Always explain your reasoning before writing code
- Write clean, readable code with comments where needed
- Highlight potential bugs, edge cases, or security risks
- Suggest improvements or alternatives when relevant
- If a question is unclear, ask for clarification before answering
- Format all code in proper markdown code blocks with the language specified`;

        case 'interview':
            return `You are an experienced technical interviewer conducting a software engineering interview.
Follow these rules strictly:
- Ask ONE question at a time — never multiple questions in one message
- Start with a brief warm welcome, then begin with an easy question and gradually increase difficulty
- After each answer: acknowledge it, give specific feedback (what was good, what was missing), then move to the next question
- Cover a mix of: data structures, algorithms, system design, and behavioral questions
- If the candidate says "I don't know", give a small hint rather than the full answer
- After 5-6 questions, provide an overall performance summary with strengths and areas to improve
- Keep a professional but encouraging tone throughout`;

        case 'normal':
        default:
            return `You are a knowledgeable and friendly AI assistant.
- Answer questions accurately and concisely — don't over-explain unless asked
- If a question is ambiguous, ask one clarifying question
- Use bullet points or structure only when it genuinely helps clarity
- Admit when you're unsure rather than guessing
- Match the user's tone — casual for casual questions, detailed for technical ones`;
    }
};

export const generateResponse = async (messages, mode = 'normal') => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in the environment variables');
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: getSystemInstruction(mode),
            },
        });

        return response.text ?? '';
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error(`Failed to generate AI response: ${error.message}`);
    }
};

export const analyzeResume = async (resumeText, jobDescription) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in the environment variables');
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const hasJD = jobDescription && jobDescription.trim() !== '';

        const systemInstruction = `You are a highly accurate ATS (Applicant Tracking System) engine and senior technical recruiter with 15+ years of experience.

Your job is to evaluate resumes with precision. You must score using this exact weighted rubric:

SCORING RUBRIC (total = 100 points):
1. Keyword Match (35 pts) — How well does the resume match required/preferred skills, tools, technologies, and terms from the job description? If no JD provided, use standard software engineering keywords.
2. Work Experience Relevance (25 pts) — Are past roles, responsibilities, and achievements directly relevant? Are impact metrics (numbers, outcomes) present?
3. Education & Certifications (10 pts) — Does the candidate meet education requirements? Are relevant certifications present?
4. Resume Formatting & ATS Compatibility (15 pts) — Is the resume clean, parseable, free of tables/columns/graphics that confuse ATS? Are standard section headers used?
5. Achievements & Impact (15 pts) — Are quantifiable achievements present (e.g., "reduced latency by 40%")? Generic duties score lower than measurable impact.

SCORING RULES:
- Be strict and realistic. Most resumes score 40–75. Only exceptional, perfectly tailored resumes score 85+.
- Do NOT inflate scores. A resume missing half the required keywords should score below 50.
- Each weakness must directly justify a score deduction.
- missingKeywords must include ALL important terms from the JD that are absent from the resume.
- matchingKeywords must only include terms genuinely present in the resume.

Return ONLY a strict JSON object with this exact structure (no markdown, no explanation):
{
  "atsScore": Number (0-100),
  "scoreBreakdown": {
    "keywordMatch": Number (0-35),
    "experienceRelevance": Number (0-25),
    "educationCertifications": Number (0-10),
    "formattingCompatibility": Number (0-15),
    "achievementsImpact": Number (0-15)
  },
  "analysis": {
    "strengths": [String],
    "weaknesses": [String],
    "matchingKeywords": [String],
    "missingKeywords": [String],
    "recommendations": [String]
  }
}`;

        let promptText = '';
        if (hasJD) {
            promptText = `Evaluate this resume against the job description below using your scoring rubric.

            JOB DESCRIPTION:
            ${jobDescription.trim()}

            RESUME:
            ${resumeText.trim()}

            Score strictly based on how well the resume matches THIS specific job description.`;
        } else {
            promptText = `Evaluate this resume for a general software engineering role using your scoring rubric.

            RESUME:
            ${resumeText.trim()}

            Score based on general software engineering standards since no job description was provided.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                temperature: 0.1,  // slight variation prevents rigid/lazy scoring
                topP: 0.85,
                topK: 40,
            },
        });

        let cleanText = (response.text ?? '{}').trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
        else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
        if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);

        const parsed = JSON.parse(cleanText.trim());

        // Validate atsScore matches scoreBreakdown sum
        if (parsed.scoreBreakdown) {
            const breakdown = parsed.scoreBreakdown;
            const calculatedTotal =
                (breakdown.keywordMatch ?? 0) +
                (breakdown.experienceRelevance ?? 0) +
                (breakdown.educationCertifications ?? 0) +
                (breakdown.formattingCompatibility ?? 0) +
                (breakdown.achievementsImpact ?? 0);

            // Override atsScore with the actual sum for consistency
            parsed.atsScore = calculatedTotal;
        }

        return parsed;
    } catch (error) {
        console.error('Error analyzing resume:', error);
        throw new Error(`Failed to analyze resume: ${error.message}`);
    }
};