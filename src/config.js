console.log('Port env:', process.env.PORT)

export const config = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL
}
