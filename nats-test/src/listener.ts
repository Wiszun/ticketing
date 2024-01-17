import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto'
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222'
})

stan.on('connect', () => {
    console.log('Listener connected to NATS')

    stan.on('close', () => {
        console.log('NATS CLOSED')
        process.exit()
    })

    new TicketCreatedListener(stan).listen()
});    
    

// signal interrupt
process.on('SIGINT', () => stan.close())

//signal terminate
process.on('SIGTERM', () => stan.close())




