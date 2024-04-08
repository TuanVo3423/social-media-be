import { MediaTypeQuery } from '~/constants/enums'
import { Pagination } from './tweets.requests'
import { Query } from 'express-serve-static-core'

export interface SearchQuery extends Pagination, Query {
  content: string
  media_type: MediaTypeQuery
  people_follow: string // 0 | 1
}
