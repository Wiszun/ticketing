import { Publisher, Subjects, TicketCreatedEvent } from "@kopytko-tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
}