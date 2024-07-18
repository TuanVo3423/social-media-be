import { ObjectId } from 'mongodb'
import databaseServices from './database.services'

class ConversationServices {
  async getConversationServices({
    sender_id,
    reciever_id,
    page,
    limit
  }: {
    sender_id: string
    reciever_id: string
    page: number
    limit: number
  }) {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          reciever_id: new ObjectId(reciever_id)
        },
        {
          sender_id: new ObjectId(reciever_id),
          reciever_id: new ObjectId(sender_id)
        }
      ]
    }
    const [count, conversations] = await Promise.all([
      databaseServices.conversations.countDocuments(match),
      databaseServices.conversations
        .find(match)
        .limit(limit)
        .skip((page - 1) * limit)
        .toArray()
    ])

    return {
      page,
      limit,
      total_page: Math.ceil(count / limit),
      conversations
    }
  }
}

const conversationServices = new ConversationServices()
export default conversationServices
