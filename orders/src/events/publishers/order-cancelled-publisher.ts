import { Publisher, Subjects, OrderCancelledEvent } from "@kopytko-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
}