import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAIConfig } from '../../utils/env.util'
import { GeminiChatCompletion, OpenaiChatCompletion } from '../../features/ai/completions'

export function Completions(request: FastifyRequest, reply: FastifyReply) {
  const config = getAIConfig()
  switch (config.type) {
    case 'gemini':
      return GeminiChatCompletion(request, reply)
    case 'openai':
      return OpenaiChatCompletion(request, reply)
    default:
      break
  }
}
