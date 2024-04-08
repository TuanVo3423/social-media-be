import { NextFunction, Request, Response } from 'express'
import { SearchQuery } from '~/models/requests/search.requests'
import searchServices from '~/services/search.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/users.requests'

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
) => {
  const _page = Number(req.query.page)
  const _limit = Number(req.query.limit)
  const _content = req.query.content as string
  const media_type = req.query.media_type
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await searchServices.advancedSearch({
    content: _content,
    limit: _limit,
    page: _page,
    user_id,
    media_type
  })
  return res.json({
    message: 'Search successfully',
    result,
    pagination: {
      page: _page,
      limit: _limit
    }
  })
}
