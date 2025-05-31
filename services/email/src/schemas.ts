import {z} from 'zod'

export const EmailSchema = z.object({
  recipient: z.string().email(),
  subject: z.string().min(1),
  body: z.string(),
  source: z.string(),
  sender: z.string().email().optional(),
})  