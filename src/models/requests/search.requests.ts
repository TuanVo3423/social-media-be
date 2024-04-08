import { MediaTypeQuery } from '~/constants/enums'
import { Pagination } from './tweets.requests'

export interface SearchQuery extends Pagination {
  content: string
  media_type: MediaTypeQuery
}
