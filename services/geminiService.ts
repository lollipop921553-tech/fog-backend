import { GoogleGenAI } from "@google/genai";
import type { User, Job, Message } from '../types';

// Initialize AI client gracefully
let ai: GoogleGenAI | null = null;
// In a real deployment, this variable must be set in the project's environment settings.
const apiKey = process.env.API_KEY;

if (apiKey) {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (error) {
        console.error("Error initializing GoogleGenAI. AI features will be disabled.", error);
    }
} else {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}


export async function* generateCoverLetterStream(job: Job, user: User) {
    if (!ai) {
        yield "AI features are disabled. API key is not configured on the server.";
        return;
    }

    const userSkills = user.skills.join(', ');
    const prompt = `
        My name is ${user.name}, and my professional tagline is "${user.tagline}". I have the following skills: ${userSkills}.
        My bio is: "${user.bio}".

        I am applying for the following job posted on the FOG platform:
        
        Job Title: "${job.title}"
        Posted By: ${job.postedBy.name}
        Job Description: "${job.description}"
        
        Please write a professional, confident, and concise cover letter for me.
        - Start the letter with "Dear ${job.postedBy.name},"
        - End with "Sincerely,\n${user.name}".
        - Keep the letter between 150 and 200 words.
        - Directly reference the job title.
        - Highlight how my skills (${userSkills}) and experience from my bio are a great match for the job requirements in the description.
        - Do not use markdown formatting.
    `;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error generating cover letter:", error);
        yield "Error: Could not generate cover letter. Please check the console for details.";
    }
}

export async function generateMessageReply(lastMessage: Message, currentUser: User) {
    if (!ai) {
        return "AI features are disabled. Please configure the API_KEY on the server.";
    }

    const prompt = `
        I am ${currentUser.name}. I am in a conversation about the job: "${lastMessage.jobSubject}".
        The last message I received was from the other person, and it says: "${lastMessage.content}".
        
        Please draft a professional and concise reply for me. Just provide the text of the reply, nothing else. Do not include a greeting or signature unless it feels natural.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating message reply:", error);
        return "Sorry, I couldn't generate a reply at this moment.";
    }
}

export interface ChatHistoryPart {
    role: "user" | "model";
    parts: { text: string }[];
}

export async function* generateAIChatResponseStream(history: ChatHistoryPart[], userName: string) {
    if (!ai) {
        yield "AI features are disabled. API key is not configured on the server.";
        return;
    }

    const systemInstruction = `You are a friendly and helpful AI customer service agent for FOG, a global freelance and local physical task platform. 
    Your name is Foggy. 
    Keep your answers concise and professional. 
    If you don't know the answer, politely say so and suggest contacting human support via the contact page.
    The user you are speaking to is named ${userName}.
    Today's date is ${new Date().toLocaleDateString()}.`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: history,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error generating AI chat response:", error);
        yield "Error: Could not generate a response. Please try again later.";
    }
}