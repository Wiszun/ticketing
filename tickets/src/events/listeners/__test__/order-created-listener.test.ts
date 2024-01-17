import mongoose from "mongoose"
import { OrderCreatedEvent, OrderStatus } from "@kopytko-tickets/common"
import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create and save a ticket 
    const ticket = Ticket.build({
        userId: 'sdcjn',
        title: 'title',
        price: 10,
    })

    await ticket.save()
    
    // fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'sdfrvjbn',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }
    // fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, ticket, msg }
}


it('sets the orderId of the ticket', async () => {
    const { listener, data, ticket, msg } = await setup()
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)
    // assertions
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id);
})

it('acks the message', async () => {
    const { data, listener, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // assertions
    expect(msg.ack).toHaveBeenCalled()
})

it.skip('publishes a ticket updated event', async () => {
    const { data, listener, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})