import { createHash } from 'crypto'
import { envConfigs } from '~/constants/config'

export function sha256(content: string) {
  return createHash('sha3-256').update(content).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + envConfigs.PASSWORD_HASH)
}
