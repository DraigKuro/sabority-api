import { Schema, model, Document } from "mongoose";

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "served";

export type ItemType =
    | "dish"
    | "drink"
    | "menu"
    | "promotion";

export interface OrderItem {
    type: ItemType;
    itemId: string;
    quantity: number;
    price?: number;
    name?: string;
}

export interface OrderDocument extends Document {
    tableId: string;
    items: OrderItem[];
    status: OrderStatus;
    total: number;
    paidAt?: Date | null;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
    {
        tableId: {
            type: String,
            required: true,
            index: true,
        },
        items: [
            {
                type: {
                    type: String,
                    enum: ["dish", "drink", "menu", "promotion"],
                    required: true,
                },
                itemId: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    min: 0,
                },
                name: {
                    type: String,
                },
                _id: false,
            },
        ],
        status: {
            type: String,
            enum: ["pending", "confirmed", "preparing", "ready", "served"],
            default: "pending",
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        paidAt: {
            type: Date,
            default: null,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

orderSchema.index({ tableId: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = model<OrderDocument>("Order", orderSchema);
