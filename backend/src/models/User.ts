import { Schema, model, InferSchemaType } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ["standard", "service_desk", "admin"],
            default: "standard",
        },
    },
    { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };
export default model<UserDoc>("User", UserSchema);
