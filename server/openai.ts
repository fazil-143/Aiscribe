import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateContent(
  prompt: string,
  toolType: string,
  tone: string = "Professional",
  length: string = "Standard"
): Promise<string> {
  let systemPrompt = "";
  
  switch (toolType) {
    case "Blog Generator":
      systemPrompt = `You are a professional blog writer. Create a well-structured blog post with headings, paragraphs, and relevant content. The tone should be ${tone}. Length should be ${length}.`;
      break;
    case "Title Creator":
      systemPrompt = `You are a title generation expert. Create a list of 10 attention-grabbing, clickable titles for content. The tone should be ${tone}.`;
      break;
    case "Idea Summarizer":
      systemPrompt = `You are a summarization expert. Transform the given text into a concise, impactful summary that captures the key points. The tone should be ${tone}. Length should be ${length}.`;
      break;
    case "Content Rewriter":
      systemPrompt = `You are a content rewriting specialist. Rewrite the provided content while maintaining its meaning but improving its clarity, readability, and engagement. The tone should be ${tone}. Length should be ${length}.`;
      break;
    case "Email Composer":
      systemPrompt = `You are an email writing expert. Create a professional email that is clear, concise, and effective. The tone should be ${tone}. Length should be ${length}.`;
      break;
    case "Social Media Copy":
      systemPrompt = `You are a social media copywriter. Create engaging, platform-specific content that drives engagement. The tone should be ${tone}. Length should be ${length}.`;
      break;
    default:
      systemPrompt = `You are a professional content writer. Create high-quality content based on the given prompt. The tone should be ${tone}. Length should be ${length}.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate content.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate content. Please try again later.");
  }
}
