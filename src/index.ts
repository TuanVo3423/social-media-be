import express, { Request, Response, NextFunction } from 'express'
import databaseServices from './services/database.services'
import usersRouter from './routes/users.routes'
const app = express()
const port = 3000
app.use(express.json())
databaseServices.connect()
app.use('/users', usersRouter)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: err.message })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
