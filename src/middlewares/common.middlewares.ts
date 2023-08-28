import { Request, Response, NextFunction } from 'express'
import { pick } from 'lodash'
// array cua cac ky cua obj
// key in T

type FilterObject<T> = Array<keyof T>

export const FilterValidator =
  <T>(filterArray: FilterObject<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterArray)
    next()
  }
