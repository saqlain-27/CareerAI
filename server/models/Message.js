import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Chat',
        },
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
