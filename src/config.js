console.log('Port env:', process.env.PORT)

export const config = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  SALT_ROUNDS: 10
}
