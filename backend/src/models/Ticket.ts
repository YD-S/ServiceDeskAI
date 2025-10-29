import { Schema, model, InferSchemaType } from "mongoose";

const TicketSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        status: {
            type: String,
            enum: ["open", "assigned", "in_progress", "closed"],
            default: "open",
        },
        media: [{ type: String }],
        location: {
            lat: Number,
            lng: Number,
        },
        aiAnalysis: { type: String, default: "" },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export type TicketDoc = InferSchemaType<typeof TicketSchema> & { _id: string };
export default model<TicketDoc>("Ticket", TicketSchema);
