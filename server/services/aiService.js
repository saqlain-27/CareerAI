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
            model: 'gemini-2.5-flash', // ✅ fixed model name
            contents,
            config: {
                systemInstruction: getSystemInstruction(mode),
            },
        });

        return response.text ?? ''; // ✅ safe fallback
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error(`Failed to generate AI response: ${error.message}`);
    }
};