import request from "supertest";
import { app } from "../../app";
import { Ticket } from '../../models/ticket'
import mongoose from "mongoose";
import { natsWrapper } from '../../nats-wrapper'

const createTicket = () => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'asdc',
        price: 22
    })
}

it('returns 404 if ticket doesnt exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app).put(`/api/tickets/${id}`).send({
        title: 'asdfacsd',
        price: 22
    }).set('Cookie', global.signin()).expect(404)
})

it('returns 401 if user not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app).put(`/api/tickets/${id}`).send({
        title: 'asdfacsd',
        price: 22
    }).expect(401)
})

it('returns 401 if user is not the ticket owner', async () => {
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({
        title: 'asdfacsd',
        price: 22
    })

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'asx',
        price: 2121212
    })
    .expect(401)
})

it('returns 400 if user provides invalid title or price', async () => {
    const cookie = global.signin()
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
        title: 'asdfacsd',
        price: 22
    })

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: '',
        price: 2121212
    })
    .expect(400)
})

it('updates the ticket if payload is correct', async () => {
    const cookie = global.signin()
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
        title: 'asdfacsd',
        price: 22
    })

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'new',
        price: 11
    })
    .expect(200)
})

it('publishes an event', async () => {
    const cookie = global.signin()
    const response = await request(app).post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
        title: 'asdfacsd',
        price: 22
    })

    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'new',
        price: 11
    })
    .expect(200)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

})