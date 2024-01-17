import { Publisher, Subjects, TicketUpdatedEvent } from "@kopytko-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
}