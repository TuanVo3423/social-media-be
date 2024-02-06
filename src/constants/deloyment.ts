import argv from 'minimist'

export const isProduction = Boolean(argv(process.argv.slice(2)).production)
