import mongoose from "mongoose";
import request from "supertest";
import { app } from '../../app';
import { Order } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { OrderStatus } from "@kopytko-tickets/common";

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    return ticket;
}

it('returns an error if the ticket does not exist', async () => {
    const ticket1 = await buildTicket()
    const ticket2 = await buildTicket()
    const ticket3 = await buildTicket()

    const userOne = global.signin()
    const userTwo = global.signin()

    await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket1.id})
    .expect(201)

    await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket2.id})
    .expect(201)
    await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket3.id})
    .expect(201)

    const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200)

    expect(response.body.length).toEqual(2)
})

// it('fetches orders of a particular user', async () => {
// })

// it('reserves a ticket', async () => {
// })