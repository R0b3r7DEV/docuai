import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'lexia',
  eventKey: process.env.INNGEST_EVENT_KEY,
})
