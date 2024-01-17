//@ts-ignore
import { Listener, Subjects, ExpirationCompleteEvent, OrderStatus } from "@kopytko-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from '../../models/order'
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    //@ts-ignore - coś sie tu ostro pokurwiło i TS nie odczytuje najnowszej wersji kopytkowej biblioteki
    readonly subject = "expiration:complete"
    queueGroupName = queueGroupName

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket')

        if(!order) {
            throw new Error('Order not found')
        }
        // or order.status = ...
        order.set({
            status: OrderStatus.Cancelled
        })

        await order.save()
        //@ts-ignore
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        msg.ack()
    } 
} 