import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@kopytko-tickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
    // it's for grouping multiple instances of one service
    // that are listening for particular event,
    // so only one of them will receive an event
    // and it won't be proccessed twice, by both
    // of services
    queueGroupName = queueGroupName
    
    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data)

        if(!ticket) {
            throw new Error('Ticket not found')
        }

        const { title, price } = data
        ticket.set({title, price})
        await ticket.save()

        msg.ack()
    }
} 