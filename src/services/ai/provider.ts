import type { AIProvider, AIModel, AIProviderType, AIMessage } from '../types';

const OPENAI_MODELS: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', maxTokens: 128000 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', maxTokens: 128000 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 16385 },
];

const ANTHROPIC_MODELS: AIModel[] = [
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', maxTokens: 200000 },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', maxTokens: 200000 },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', maxTokens: 200000 },
];

const GOOGLE_MODELS: AIModel[] = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', maxTokens: 2000000 },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', maxTokens: 1000000 },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', provider: 'google', maxTokens: 1000000 },
];

const META_MODELS: AIModel[] = [
  { id: 'llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'meta', maxTokens: 128000 },
  { id: 'llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'meta', maxTokens: 128000 },
  { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'meta', maxTokens: 128000 },
];

const OLLAMA_MODELS: AIModel[] = [
  { id: 'llama3.1', name: 'Llama 3.1', provider: 'ollama', maxTokens: 32768 },
  { id: 'mistral', name: 'Mistral', provider: 'ollama', maxTokens: 32768 },
  { id: 'codellama', name: 'Code Llama', provider: 'ollama', maxTokens: 16384 },
];

export const DEFAULT_MODELS: Record<AIProviderType, AIModel[]> = {
  openai: OPENAI_MODELS,
  anthropic: ANTHROPIC_MODELS,
  google: GOOGLE_MODELS,
  meta: META_MODELS,
  ollama: OLLAMA_MODELS,
};

export const TASK_TYPE_RECOMMENDATIONS: Record<string, AIProviderType> = {
  code: 'openai',
  creative: 'anthropic',
  analysis: 'anthropic',
  fast: 'openai',
  reasoning: 'openai',
  local: 'ollama',
};

export function getRecommendedProvider(taskType: string): AIProviderType {
  return TASK_TYPE_RECOMMENDATIONS[taskType] || 'openai';
}

export function getProviderModels(provider: AIProviderType): AIModel[] {
  return DEFAULT_MODELS[provider] || [];
}

export async function callAI(
  provider: AIProvider,
  modelId: string,
  messages: AIMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = provider.apiKey;
  if (!apiKey) {
    throw new Error(`API key not configured for ${provider.name}`);
  }

  switch (provider.type) {
    case 'openai':
      return callOpenAI(apiKey, modelId, messages, onChunk);
    case 'anthropic':
      return callAnthropic(apiKey, modelId, messages, onChunk);
    case 'google':
      return callGoogle(apiKey, modelId, messages, onChunk);
    case 'meta':
      return callMeta(apiKey, modelId, messages, onChunk);
    case 'ollama':
      return callOllama(modelId, messages, onChunk);
    default:
      throw new Error(`Unknown provider: ${provider.type}`);
  }
}

async function callOpenAI(
  apiKey: string,
  modelId: string,
  messages: AIMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: !!onChunk,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  if (onChunk && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));
      
      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            result += content;
            onChunk(content);
          }
        } catch {}
      }
    }

    return result;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(
  apiKey: string,
  modelId: string,
  messages: AIMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemMessage = messages.find((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelId,
      messages: conversationMessages.map((m) => ({ role: m.role, content: m.content })),
      system: systemMessage?.content,
      stream: !!onChunk,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  if (onChunk && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));
      
      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.delta?.text || '';
          if (content) {
            result += content;
            onChunk(content);
          }
        } catch {}
      }
    }

    return result;
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callGoogle(
  apiKey: string,
  modelId: string,
  messages: AIMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Google API error');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callMeta(
  apiKey: string,
  modelId: string,
  messages: AIMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch('https://api.meta-llama.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Meta API error');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOllama(
  modelId: string,
  messages: AIMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelId,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: !!onChunk,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}. Make sure Ollama is running.`);
  }

  if (onChunk && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.length > 0);
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const content = parsed.message?.content || '';
          if (content) {
            result += content;
            onChunk(content);
          }
          if (parsed.done) break;
        } catch {}
      }
    }

    return result;
  }

  const data = await response.json();
  return data.message?.content || '';
}

export async function summarizeText(text: string, provider: AIProvider, modelId: string): Promise<string> {
  const messages: AIMessage[] = [
    {
      id: '1',
      role: 'user',
      content: `Please summarize the following text concisely:\n\n${text}`,
      timestamp: new Date(),
    },
  ];

  return callAI(provider, modelId, messages);
}

export async function writeContent(
  prompt: string,
  provider: AIProvider,
  modelId: string,
  context?: string
): Promise<string> {
  const messages: AIMessage[] = [
    {
      id: '1',
      role: 'user',
      content: context
        ? `${prompt}\n\nContext:\n${context}`
        : prompt,
      timestamp: new Date(),
    },
  ];

  return callAI(provider, modelId, messages);
}

export async function chatWithAI(
  messages: AIMessage[],
  provider: AIProvider,
  modelId: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  return callAI(provider, modelId, messages, onChunk);
}
