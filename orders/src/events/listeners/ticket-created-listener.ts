import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@kopytko-tickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from './queue-group-name'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
    // it's for grouping multiple instances of one service
    // that are listening for particular event,
    // so only one of them will receive an event
    // and it won't be proccessed twice, by both
    // of services
    queueGroupName = queueGroupName
    
    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const { title, price, id } = data;
        // this build function need to be adjusted,
        // because it needs to acceps the ID of the
        // copied ticket, instead of creating a new ID,
        // so we can identify the particular ticket
        // in the future
        const ticket = Ticket.build({
            id, title, price
        })
        await ticket.save()

        msg.ack()
    }
} 