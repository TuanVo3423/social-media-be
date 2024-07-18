import { ObjectId } from 'mongodb'

interface IConversation {
  _id?: ObjectId
  sender_id: ObjectId
  reciever_id: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
}

export default class Conversation {
  _id?: ObjectId
  sender_id: ObjectId
  reciever_id: ObjectId
  content: string
  created_at: Date
  updated_at: Date
  constructor({ _id, sender_id, reciever_id, created_at, updated_at, content }: IConversation) {
    const date = new Date()
    this._id = _id
    this.sender_id = sender_id
    this.reciever_id = reciever_id
    this.content = content
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
