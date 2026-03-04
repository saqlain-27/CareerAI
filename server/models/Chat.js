import mongoose from 'mongoose';

const chatSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            default: 'New Chat',
        },
        mode: {
            type: String,
            enum: ['normal', 'coding', 'interview'],
            default: 'normal',
        },
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
