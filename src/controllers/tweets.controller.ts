import { Request, Response, NextFunction } from 'express'
export const createTweetController = async (req: Request, res: Response, next: NextFunction) => {
  res.send('createTweetController')
}
