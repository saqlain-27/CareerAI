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

const createChatAiError = (error) => {
    const rawMessage = typeof error?.message === 'string' ? error.message : '';
    const rawStatus = error?.status || error?.code || '';
    const errorText = `${rawMessage} ${rawStatus}`.toLowerCase();

    if (errorText.includes('503') || errorText.includes('unavailable') || errorText.includes('high demand')) {
        const unavailableError = new Error('AI is busy right now. Please try again in a moment.');
        unavailableError.statusCode = 503;
        return unavailableError;
    }

    if (
        errorText.includes('429') ||
        errorText.includes('quota') ||
        errorText.includes('rate limit') ||
        errorText.includes('resource_exhausted')
    ) {
        const limitError = new Error('AI usage limit reached. Please try again later.');
        limitError.statusCode = 429;
        return limitError;
    }

    const fallbackError = new Error('AI response failed. Please try again.');
    fallbackError.statusCode = 500;
    return fallbackError;
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
            model: 'gemini-2.5-flash-lite',
            contents,
            config: {
                systemInstruction: getSystemInstruction(mode),
            },
        });

        return response.text ?? '';
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw createChatAiError(error);
    }
};

export const analyzeResume = async (resumeText, jobDescription) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in the environment variables');
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const hasJD = jobDescription && jobDescription.trim() !== '';

        const systemInstruction = `You are an extremely strict, cynical, no-nonsense ATS system combined with a brutally honest senior technical recruiter who has rejected thousands of resumes over 15+ years.

You score resumes harshly and realistically — just like real competitive job markets. 
Most decent resumes score 45-68. Well-tailored strong ones usually get 70-80. 
Scores of 85+ are VERY rare and ONLY for near-perfect, highly tailored resumes that hit almost every requirement with strong evidence and impact. 
90+ is practically impossible in real life.

Be ruthless. Never give the benefit of the doubt. Never inflate scores to be polite or encouraging. 
If something is missing, weak, vague, outdated, generic, or only partially matches → deduct heavily or give zero/very low points.

SCORING RUBRIC (total = 100 points) — allocate points conservatively:

1. Keyword Match (35 pts) 
   - Extremely tight matching required. Exact or very close variants only. 
   - Synonyms / related terms get only partial credit at best.
   - <40% important keywords present → 0-9 pts
   - 40-60% → 10-17 pts
   - 60-80% → 18-25 pts
   - 80-95% with good context/placement → 26-32 pts
   - 95%+ near-perfect coverage → 33-35 pts only

2. Work Experience Relevance (25 pts) 
   - Must be directly relevant roles & responsibilities. 
   - Vague descriptions, unrelated experience, or no clear progression → heavy deductions.
   - Strong impact metrics required for high scores.

3. Education & Certifications (10 pts) 
   - Meets exact requirements? → full points possible.
   - Close but not exact, or missing key certs → 4-7 max.
   - Irrelevant or missing → 0-3.

4. Resume Formatting & ATS Compatibility (15 pts) 
   - Clean plain text, standard headers, no tables/columns/images/fancy formatting → high score.
   - Any hint of ATS-unfriendly elements (guessed from text) → deduct significantly.

5. Achievements & Impact (15 pts) 
   - Quantifiable achievements (%, $, numbers, before/after) required for good points.
   - Generic duties/responsibilities only → 0-5 pts max.
   - Strong metrics in relevant areas → up to 12-15 only if exceptional.

SCORING RULES — follow strictly:
- Typical good-but-not-tailored resumes: 50-68
- Strong tailored resumes: 70-82
- Only near-perfect matches: 83-89 (very rare)
- Do NOT give partial points generously. Be stingy.
- Every weakness must be reflected in lower category scores.
- missingKeywords: list ALL meaningful missing terms from JD (be comprehensive).
- matchingKeywords: only genuinely present terms (no wishful thinking).
- Do NOT inflate ANY category to make the total look better.

Return ONLY a strict JSON object with this exact structure (no markdown, no extra text, no explanations):
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

            Score strictly and harshly based on how well the resume matches THIS specific job description.`;
        } else {
            promptText = `Evaluate this resume for a general software engineering role using your scoring rubric.

            RESUME:
            ${resumeText.trim()}

            Score harshly based on competitive general software engineering standards since no job description was provided.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                temperature: 0,     // zero for maximum consistency & to prevent generous drift
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

export const generateInterviewQuestion = async (targetRole, experienceLevel, jobDescription, pastQuestions) => {
    try {
        if (!process.env.GEMINI_API_KEY)
            throw new Error('GEMINI_API_KEY is missing');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let promptText = `Target Role: ${targetRole}\nExperience Level: ${experienceLevel}\n`;
        if (jobDescription)
            promptText += `Job Description Context: ${jobDescription}\n`;

        if (pastQuestions && pastQuestions.length > 0) {
            promptText += `\nPast Questions Asked In This Session:\n`;
            pastQuestions.forEach((q, i) => promptText += `${i + 1}. ${q.questionText}\n`);
            promptText += `\nGenerate the NEXT technical interview question. Do NOT repeat past questions or topics. Progress the interview naturally.`;
        } else {
            promptText += `\nGenerate the FIRST question for this technical interview. Start with something foundational but relevant.`;
        }

        const systemInstruction = `You are an expert technical interviewer.
    Based on the role, experience level, and past questions, generate ONE highly relevant, realistic technical interview question.
    Do NOT output anything except a strict JSON object with this format:
    {
    "questionText": "The actual question you are asking the candidate."
    }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                temperature: 0.7,
            },
        });

        const cleanText = (response.text ?? '{}').replace(/^```json\n|```$/g, '').trim();
        return JSON.parse(cleanText).questionText;
    } catch (error) {
        console.error('Error generating interview question:', error);
        throw new Error('Failed to generate interview question.');
    }
};

export const evaluateInterviewAnswer = async (questionText, userAnswer) => {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const promptText = `Question Asked: ${questionText}\n\nCandidate's Answer: ${userAnswer}\n\nEvaluate this answer blindly and objectively.`;

        const systemInstruction = `You are a strict technical interviewer grading candidate answers.
Evaluate the candidate's answer to the question. Focus on accuracy, depth, clarity, and correctness.
Return ONLY a strict JSON object with this exact format:
{
  "score": Number, // Rating from 1 to 10
  "aiFeedback": String // Actionable feedback: what was good, what was missing, or how to improve
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                temperature: 0.2, // Need consistent, relatively strict grading
            },
        });

        const cleanText = (response.text ?? '{}').replace(/^```json\n|```$/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error evaluating interview answer:', error);
        throw new Error('Failed to evaluate interview answer.');
    }
};

export const generateFinalInterviewSummary = async (targetRole, experienceLevel, questionsAndAnswers) => {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let promptText = `Interview for: ${targetRole} (${experienceLevel})\n\nInterview Transcript:\n`;
        questionsAndAnswers.forEach((qa, i) => {
            promptText += `\nQ${i + 1}: ${qa.questionText}\n`;
            promptText += `Candidate Answer: ${qa.userAnswer}\n`;
            promptText += `AI Score: ${qa.score}/10\n`;
            promptText += `Feedback Given: ${qa.aiFeedback}\n`;
        });

        promptText += `\nProvide a final comprehensive performance review based on the entire transcript.`;

        const systemInstruction = `You are a Senior Engineering Manager deciding whether to pass a candidate to the next round.
Review the entire transcript of their answers and the scores they received.
Format your output EXACTLY as this JSON structure:
{
  "finalScore": Number, // Overall score roughly out of 100 based on their average performance
  "finalFeedback": {
    "strengths": [String], // Array of strong areas
    "weaknesses": [String], // Array of areas requiring improvement
    "overallAnalysis": String // 2-3 sentence summary of their performance
  }
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                temperature: 0.3,
            },
        });

        const cleanText = (response.text ?? '{}').replace(/^```json\n|```$/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error generating interview summary:', error);
        throw new Error('Failed to generate final interview summary.');
    }
};
