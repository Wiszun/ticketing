import request from "supertest";
import { app } from "../../app";
import { Ticket } from '../../models/ticket'
// even if we import the original one, we will get the mock
import { natsWrapper } from '../../nats-wrapper'

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .send({})

    expect(response.status).not.toEqual(404)
})

it('can be accessed if user is signed in', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .send({})

    expect(response.status).toEqual(401)
})

it('invalid title', async () => {
    
})

it('invalid price', async () => {
    
})

it('creates a ticket with valid params', async () => {
    let tickets = await Ticket.find({})

    expect(tickets.length).toEqual(0)

    const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
        title: 'xD',
        price: 22
    })

    tickets = await Ticket.find({})
    expect(tickets.length).toEqual(1)
}) 

it('publishes an event', async () => {
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
        title: 'xD',
        price: 22
    }).expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})
