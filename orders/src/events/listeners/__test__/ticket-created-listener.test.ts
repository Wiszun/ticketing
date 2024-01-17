import mongoose from "mongoose"
import { TicketCreatedEvent } from "@kopytko-tickets/common"
import { TicketCreatedListener } from "../ticket-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client)
    // fake data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'title',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }
    // fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg }
}


it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup()
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)
    // assertions
    const ticket = await Ticket.findById(data.id)

    expect(ticket).toBeDefined();
})

it('acks the message', async () => {
    const { data, listener, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // assertions
    expect(msg.ack).toHaveBeenCalled()
})