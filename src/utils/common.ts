import { isNumber } from 'lodash'

export const getNameFromEmail = (email: string) => {
  return email.split('@')[0]
}

export const getArrayFromEnum = (enumObject: { [key in string]: string | number }) => {
  return Object.values(enumObject).filter((value) => typeof value === 'number') as number[]
}
