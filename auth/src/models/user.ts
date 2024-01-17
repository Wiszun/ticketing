import mongoose from "mongoose";
import { Password } from '../services/password'

interface UserAttrs {
    email: string,
    password: string
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

// single user
interface UserDoc extends mongoose.Document {
    email: string,
    password: string,
}

const userSchema = new mongoose.Schema({
    email: {
        type: String, // Capital S, because we're reffering to JS String constructor
        require: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password
            delete ret.__v
            ret.id = ret._id
            delete ret._id
        }
    }
})

// mongoose middleware
userSchema.pre('save', async function(done) {
    // this reffers to the entry, that the operation is being performed on - User in this case, that is being created
    if ((this as any).isModified('password')) {
        const hashed = await Password.toHash((this as any).get('password')) as any
        (this as any).set('password', hashed)
    }
    done()
})

// incorporating build function in static attributes of mongo user schema
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };