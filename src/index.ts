import express from 'express'
import { config } from 'dotenv'
config()
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import databaseServices from './services/database.services'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import './utils/s3'
// import '~/utils/fake'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { ObjectId } from 'mongodb'
import Conversation from './models/schemas/Conversation.schema'
import conversationRouter from './routes/conversations.routes'
import cors from 'cors'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { envConfigs } from './constants/config'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false
})

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Social Media API',
      version: '1.0.0',
      description: 'API for social media app',
      contact: {
        name: 'Tuan Vo',
        email: 'tuanvanvo2003@gmail.com',
        url: 'https://titus-portfolio.vercel.app'
      }
    }
  },
  apis: ['./swagger/*.yaml']
}

const swaggerDocs = swaggerJsdoc(options)

databaseServices.connect().then(() => {
  databaseServices.indexUsers()
  databaseServices.indexRefreshTokens()
  databaseServices.indexFollowers()
  databaseServices.indexHashtags()
  databaseServices.indexTweets()
})
const app = express()
const httpServer = createServer(app)
const port = envConfigs.PORT

initFolder()

const corsOptions = {
  // allow all
  origin: true,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200
}
app.use(limiter)
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationRouter)
app.use('/static', staticRouter)
app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3001' // allow all
  }
})

// list of users
const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  // set auth for user
  console.log(`user ${socket.id} connected`)
  console.log('socket.handshake.auth', socket.handshake.auth._id)
  const user_id = socket.handshake.auth._id // userid from client ban sang dua vao auth()
  // push id vao danh sach
  if (user_id !== undefined) {
    users[user_id] = {
      socket_id: socket.id
    }
    console.log('users: ', users)
  }

  // handle private message
  // {to, from, content} : to : user_id, we need to get socket_id
  socket.on('private message', async (data) => {
    const reciever_user_id = users[data.to].socket_id
    const sender_user_id = users[data.from].socket_id
    socket.to(reciever_user_id).emit('reciever private message', {
      content: data.content,
      from: user_id
    })
    // save into db
    await databaseServices.conversations.insertOne(
      new Conversation({
        content: data.content,
        reciever_id: new ObjectId(reciever_user_id),
        sender_id: new ObjectId(sender_user_id)
      })
    )
  })

  socket.on('disconnect', (reason) => {
    // ...
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
  })
})

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
