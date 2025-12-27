import crypto from 'crypto';
import * as validator from './validator.js';
import Groq from 'groq-sdk';

let groq;

const SYSTEM_PROMPT = `You are the Phase Architect, a world-class Engineering Project Consultant. 

MISSION:
Your goal is to DISCOVER and REFINE the user's engineering passions through adaptive dialogue. 

GUIDELINES:
- PROJECT QUERIES: When a user asks about a specific project, provide a high-detail, deep-dive explanation of the tech stack, core modules, and industrial impact.
- NO TABLES: Do NOT use tabular formats. Use clean paragraphs, bold headers, and bullet points only.
- ADAPTIVE LENGTH: Short answers for simple questions, long-form for complex technical discussions.
- NO STARS: Do not use asterisks (*). Use natural language and bolding for emphasis.

When you propose a project idea, use this EXACT format so the system can lock it:
PROPOSED PROJECT TITLE: [Title Here]
DETAILED EXPLANATION: [A deep-dive technical description and Roadmap summary]`;

const getGroq = () => {
    if (!groq) {
        const apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn("[Phase Architect] GROQ_API_KEY is missing. AI features will be disabled.");
        }
        groq = new Groq({ apiKey });
    }
    return groq;
};

export const projectGenerator = async (data) => {
    try {
        const groqInstance = getGroq();
        if (!groqInstance.apiKey) throw new Error("API Key missing");

        const prompt = `As an expert Engineering Architect, generate a professional, high-impact project idea for a student.
        Branch: ${data.branch}
        Skills: ${data.skills.join(', ')}
        Interests: ${data.interests.join(', ')}
        Constraints: ${data.constraints.join(', ')}
        
        Provide only the project title and a one-sentence objective. Format: "Title: Objective text"`;

        const completion = await groqInstance.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 150,
        });

        return completion.choices[0]?.message?.content || "Industrial System: Automated engineering solution.";
    } catch (err) {
        console.error("[Groq Error] Falling back to template generation:", err);
        return `${data.branch} project focusing on ${data.interests[0] || 'engineering'} using ${data.skills[0] || 'technical'} skills.`;
    }
};

export const chatWithArchitect = async (messages) => {
    try {
        const groqInstance = getGroq();
        if (!groqInstance.apiKey) throw new Error("API Key missing");

        const completion = await groqInstance.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2048,
        });

        const content = completion.choices[0]?.message?.content || "I encountered a glitch in my reasoning matrix. Can you repeat that?";
        return content;
    } catch (err) {
        console.error("[Groq Chat Error]", err);
        return "System Overload. Please try again in a moment.";
    }
};

const generateUniqueId = () => {
    return crypto.randomUUID();
};

const saveProjectIdea = (data) => {
    // Logic to log persistence (actual saving is handled by the route via Mongoose)
    console.log(`[Phase Persistence] Idea ${data.uniqueId} indexed for persistence.`);
};

export const generateProjectIdea = async (data) => {
    const idea = await projectGenerator(data);
    const uniqueId = generateUniqueId();

    // Persist local record
    saveProjectIdea({ uniqueId, idea });

    // Validate the novelty of the generated idea (Async DB Check)
    const isNovel = await validator.isNovel(idea);

    return { idea, uniqueId, isNovel };
};
