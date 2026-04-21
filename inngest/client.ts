import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'docuai',
  eventKey: process.env.INNGEST_EVENT_KEY,
})
