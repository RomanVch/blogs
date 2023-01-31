export const settings = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET||'123',
    REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET||'321'
}