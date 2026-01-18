import { Order, OrderDocument, OrderItem, OrderStatus } from "../models/order";
import { Dish } from "../models/dish";
import { Drink } from "../models/drink";
import { Menu } from "../models/menu";
import { Promotion } from "../models/promotion";

type CreateOrderInput = {
    tableId: string;
    items: Array<{ _id: string; cantidad: number }>;
};

const getItemDetails = async (itemId: string): Promise<{ type: string; price: number; name: string } | null> => {
    let item = await Dish.findById(itemId);
    if (item) {
        return { type: "dish", price: item.precio, name: item.nombre };
    }

    const drink = await Drink.findById(itemId);
    if (drink) {
        return { type: "drink", price: drink.precio, name: drink.nombre };
    }

    const menu = await Menu.findById(itemId);
    if (menu) {
        return { type: "menu", price: menu.precio, name: menu.nombre };
    }

    const promotion = await Promotion.findById(itemId);
    if (promotion) {
        return { type: "promotion", price: promotion.precio, name: promotion.nombre };
    }

    return null;
};

export const createOrder = async (input: CreateOrderInput): Promise<OrderDocument> => {
    const { tableId, items } = input;

    if (!items || items.length === 0) {
        throw new Error("La orden debe contener al menos un item");
    }

    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const item of items) {
        if (!item._id || !item.cantidad || item.cantidad < 1) {
            throw new Error("Cada item debe tener un _id y cantidad válida");
        }

        const details = await getItemDetails(item._id);

        if (!details) {
            throw new Error(`Item con ID ${item._id} no encontrado`);
        }

        if (details.type === "promotion") {
            const promotion = await Promotion.findById(item._id);
            if (promotion && item.cantidad > promotion.cantidad) {
                throw new Error(`Cantidad solicitada para ${details.name} excede el límite disponible`);
            }
        }

        orderItems.push({
            type: details.type as any,
            itemId: item._id,
            quantity: item.cantidad,
            price: details.price,
            name: details.name,
        });

        total += details.price * item.cantidad;
    }

    total = Math.round(total * 100) / 100;

    const order = new Order({
        tableId,
        items: orderItems,
        total,
        status: "pending",
    });

    return order.save();
};

export const getOrderById = async (orderId: string): Promise<OrderDocument | null> => {
    return Order.findById(orderId).exec();
};

export const getOrdersByTable = async (tableId: string): Promise<OrderDocument[]> => {
    return Order.find({
        tableId,
        deletedAt: null,
    })
        .sort({ createdAt: -1 })
        .exec();
};

export const getActiveOrderByTable = async (tableId: string): Promise<OrderDocument | null> => {
    return Order.findOne({
        tableId,
        status: { $ne: "served" },
        deletedAt: null,
    })
        .sort({ createdAt: -1 })
        .exec();
};

export const getAllActiveOrders = async (): Promise<OrderDocument[]> => {
    return Order.find({
        status: { $ne: "served" },
        deletedAt: null,
    })
        .sort({ createdAt: 1 })
        .exec();
};

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed"],
    confirmed: ["preparing"],
    preparing: ["ready"],
    ready: ["served"],
    served: [],
};

export const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<OrderDocument> => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error("Order not found");
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status];

    if (!allowedTransitions.includes(newStatus)) {
        throw new Error(
            `Invalid status transition from ${order.status} to ${newStatus}`
        );
    }

    order.status = newStatus;

    if (newStatus === "served") {
        order.paidAt = new Date();
    }

    return order.save();
};