import { AzureKeyCredential, OpenAIClient } from '@azure/openai'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAIConfig } from '../../../utils/env.util'

const azureOpenai = new OpenAIClient(
  'https://volare2.openai.azure.com/',
  new AzureKeyCredential('8b9313f1e69143aca0c19a1fe0aede27'),
)

export async function OpenaiChatCompletion(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as {
    additional_system_instructions: string
    temperature: number
    messages: {
      content: {
        system_instructions: string
        command_instructions: string
        text: string
        temperature: number
        [key: string]: string | number
      }
      author: 'user' | 'assistant'
    }[]
  }

  const openai_message = []
  let temperature = Number(getAIConfig().temperature)
  const messages = body.messages
  for (const message of messages) {
    if ('system_instructions' in message.content) {
      openai_message.push(
        {
          role: 'system',
          content: message.content.system_instructions,
        },
      )
    }

    if ('command_instructions' in message.content) {
      openai_message.push(
        {
          role: 'system',
          content: message.content.command_instructions,
        },
      )
    }

    if ('additional_system_instructions' in body) {
      openai_message.push(
        {
          role: 'system',
          content: body.additional_system_instructions,
        },
      )
    }

    if ('text' in message.content) {
      openai_message.push(
        {
          role: message.author,
          content: message.content.text,
        },
      )
    }

    if ('temperature' in message.content)
      temperature = message.content.temperature
  }

  const events = await azureOpenai.streamChatCompletions('hz-gpt4-preview', openai_message as any, { temperature, maxTokens: getAIConfig().max_tokens ? Number(getAIConfig().max_tokens) : undefined })

  return reply.sse((async function* source() {
    try {
      for await (const data of events) {
        const res = {
          text: data.choices[0]?.delta?.content || '',
          finish_reason: null,
        }
        yield { data: JSON.stringify(res) }
      }
    }
    catch (e: any) {
      console.error('Error: ', e.message)
      const res = {
        text: '',
        finish_reason: e.message || '',
      }
      yield { data: JSON.stringify(res) }
    }
    finally {
      const res = {
        text: '',
        finish_reason: 'stop',
      }
      yield { data: JSON.stringify(res) }
    }
  })())
}
