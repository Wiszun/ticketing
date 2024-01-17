import { natsWrapper } from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
    if(!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined')
    }
    if(!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined')
    }
    if(!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined')
    }
    try {
        // the clusterID is the same as in nats-depl file, in the -cid argument (clusterID)
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed')
            process.exit()
        })

        // signal interrupt
        process.on('SIGINT', () => natsWrapper.client.close())
        //signal terminate
        process.on('SIGTERM', () => natsWrapper.client.close())

        new OrderCreatedListener(natsWrapper.client).listen()
    } catch (err) {
        console.error(err)
    }
};

start()  