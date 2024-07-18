import { Request, Response } from 'express'
import { CONVERSATION_MESSAGES } from '~/constants/message'
import conversationServices from '~/services/conversations.services'
export const getConversationsController = async (req: Request, res: Response) => {
  const sender_id = req.decoded_authorization?.user_id as string
  const { reciever_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const result = await conversationServices.getConversationServices({ sender_id, reciever_id, limit, page })

  return res.json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATIONS,
    result
  })
}
