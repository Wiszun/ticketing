import mongoose from "mongoose"
import { TicketUpdatedEvent } from "@kopytko-tickets/common"
import { TicketUpdatedListener } from "../ticket-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // create and save a ticket 
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'title',
        price: 10,
    })

    await ticket.save()

    // fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'new title',
        price: 999,
        version: ticket.version + 1,
        userId: 'asdcac',
    }
    // fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg, ticket }
}


it('finds, updates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup()
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)
    // assertions
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
})

it('acks the message', async () => {
    const { data, listener, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // assertions
    expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
    const { listener, data, msg, ticket } = await setup()
    
    data.version = 10;

    // we need to capture this error. Otherwise, the test will fail, even if the error is expected
    try {
        await listener.onMessage(data, msg)
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled()
})