import mongoose, { InferSchemaType, Model } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        apiKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        usage: {
            type: Number,
            default: 0,
            min: 0,
        },
        limit: {
            type: Number,
            default: 0,
            min: 0,
        },
        active: {
            type: Boolean,
            default: true,
            required: true,
        },
        plan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free",
            required: true,
        },
        billingDate: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
    _id: mongoose.Types.ObjectId;
};

const User = (mongoose.models.User as Model<UserDocument>) || mongoose.model<UserDocument>("User", userSchema);

export default User;
