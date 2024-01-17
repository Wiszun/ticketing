import express, { Request, Response}  from 'express'
import { body } from 'express-validator'
import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@kopytko-tickets/common'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post('/api/payments', requireAuth, [
    body('token').not().isEmpty().withMessage('Token is required'),
    body('orderId').not().isEmpty().withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)

    if(!order) {
        throw new NotFoundError()
    }

    if(order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('bad request')
    }

    await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token
    })

    res.status(201).send({
        success: true
    })
})

export { router as createChargeRouter }