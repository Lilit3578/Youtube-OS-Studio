import axios from "axios";

/**
 * OpenAI Chat Completion Message Types
 */
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

interface ChatCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
}

interface ChatCompletionResponse {
  answer: string;
  usage: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
}

/**
 * Send a chat completion request to OpenAI GPT-4
 * 
 * @param messages - Array of chat messages with role and content
 * @param options - Optional configuration for the completion
 * @returns The assistant's response and token usage information
 * @throws Error if OPENAI_API_KEY is not configured or API call fails
 */
export const sendOpenAi = async (
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResponse | null> => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not configured. " +
      "Please add it to your .env.local file."
    );
  }

  const {
    model = "gpt-4",
    maxTokens = 100,
    temperature = 1,
    userId,
  } = options;

  console.log("Ask GPT >>>");
  messages.forEach((m) =>
    console.log(` - ${m.role.toUpperCase()}: ${m.content}`)
  );

  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    ...(userId && { user: userId }),
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      body,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.choices[0].message.content;
    const usage = response.data.usage;

    console.log(`>>> ${answer}`);
    console.log(
      `TOKENS USED: ${usage.total_tokens} ` +
      `(prompt: ${usage.prompt_tokens} / response: ${usage.completion_tokens})`
    );
    console.log("\n");

    return {
      answer,
      usage: {
        totalTokens: usage.total_tokens,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
      },
    };
  } catch (error: any) {
    console.error("GPT Error:", error?.response?.status, error?.response?.data);

    // Don't throw, return null to match original behavior
    // Consider throwing in production for better error handling
    return null;
  }
};
