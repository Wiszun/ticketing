import request from "supertest";
import { app } from "../../app";
import { Ticket } from '../../models/ticket'

const createTicket = () => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'asdc',
        price: 22
    })
}

it('fetch ticket list', async () => {
    await createTicket()
    await createTicket()
    await createTicket()

    const response = await request(app).get('/api/tickets').send().expect(200)

    expect(response.body.length).toEqual(3)
})