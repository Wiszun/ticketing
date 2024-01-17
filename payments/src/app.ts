import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { NotFoundError, errorHandler, currentUser, requireAuth, } from '@kopytko-tickets/common'
import { createChargeRouter } from './routes/new'

const app = express();
// allows https traffic
app.set('trust proxy', true)
app.use(json());


app.use(cookieSession({
    // removes encryption
    signed: false,
    // allows sending cookie only by https connection
    secure: process.env.NODE_ENV !== 'test'
}))

app.use(currentUser)

app.use(createChargeRouter)

app.all('*', async () => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }