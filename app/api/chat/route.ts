import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseServer } from '@/lib/supabase/server'
import { buildChatSystemPrompt } from '@/lib/claude/prompts'
import { ChatRequestSchema } from '@/lib/utils/validators'
import { handleApiError } from '@/lib/utils/errors'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { MAX_CHAT_CONTEXT_DOCS, MAX_CHAT_HISTORY_TURNS } from '@/types/app'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()
    const body = ChatRequestSchema.parse(await req.json())

    // Last 60 done documents with extraction
    const { data: docs } = await supabaseServer
      .from('documents')
      .select('filename, mime_type, created_at, extraction:document_extractions(type, issue_date, vendor, concept, amount, currency, category, confidence_score)')
      .eq('organization_id', user.organization_id)
      .eq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(MAX_CHAT_CONTEXT_DOCS)

    const documentsContext = JSON.stringify(docs ?? [], null, 2)
    const hasDocuments = (docs ?? []).length > 0

    // Last 20 history turns (oldest first)
    const { data: history } = await supabaseServer
      .from('chat_messages')
      .select('role, content')
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })
      .limit(MAX_CHAT_HISTORY_TURNS)

    const historyMessages = (history ?? []).reverse().map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Persist user message before streaming
    await supabaseServer.from('chat_messages').insert({
      organization_id: user.organization_id,
      user_id: user.id,
      role: 'user',
      content: body.message,
    })

    const encoder = new TextEncoder()
    let assistantContent = ''

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: string) =>
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))

        try {
          const claudeStream = client.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: buildChatSystemPrompt(documentsContext, hasDocuments),
            messages: [
              ...historyMessages,
              { role: 'user', content: body.message },
            ],
          })

          for await (const event of claudeStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              assistantContent += event.delta.text
              send(JSON.stringify({ text: event.delta.text }))
            }
          }

          // Persist assistant reply
          await supabaseServer.from('chat_messages').insert({
            organization_id: user.organization_id,
            user_id: user.id,
            role: 'assistant',
            content: assistantContent,
          })

          send('[DONE]')
        } catch (err) {
          send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
