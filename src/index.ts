import express from 'express'
import { config } from 'dotenv'
config()
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import databaseServices from './services/database.services'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'

databaseServices.connect()
const app = express()
const port = process.env.PORT || 3000

initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
