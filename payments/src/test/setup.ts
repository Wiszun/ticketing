import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

jest.mock('../nats-wrapper')
let mongo: any;

declare global {
    var signin: () => string[];
  }


beforeAll(async () => {
    process.env.JWT_KEY = 'askdhjb'
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri()

    await mongoose.connect(mongoUri)
})

beforeEach(async () => {
    jest.clearAllMocks()
    const collections = await mongoose.connection.db.collections()

    for (let collection of collections) {
        await collection.deleteMany({})
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop()
    }
    await mongoose.connection.close()
})

global.signin = () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    const payload = {
        id,
        email: 'ttttt@ttt.com'
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!)

    const session = {
        jwt: token
    }

    const sessionJSON = JSON.stringify(session)

    const base64 = Buffer.from(sessionJSON).toString('base64')

    return [`session=${base64}`]
} 