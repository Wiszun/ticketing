import { Subjects, Publisher, ExpirationCompleteEvent } from "@kopytko-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete
}