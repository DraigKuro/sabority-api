import { Request, Response } from "express";
import * as orderService  from "../services/orderService";
import { OrderStatus } from "../models/order";

export const createOrderController = async (req: Request, res: Response) => {
    try {
        const { mesa_uid, items } = req.body;

        if (!mesa_uid) {
            return res.status(400).json({
                success: false,
                message: "El ID de la mesa es requerido",
            });
        }

        const order = await orderService.createOrder({
            tableId: mesa_uid,
            items,
        });

        res.status(201).json({
            success: true,
            message: "Orden creada exitosamente",
            order,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(400).json({
            success: false,
            message: (error as Error).message,
        });
    }
};

export const getOrderByIdController = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const order = await orderService.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};

export const getOrdersByTableController = async (req: Request, res: Response) => {
    try {
        const { tableId } = req.params;

        const orders = await orderService.getOrdersByTable(tableId);

        res.json({
            success: true,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};

export const getActiveOrderByTableController = async (req: Request, res: Response) => {
    try {
        const { tableId } = req.params;

        const order = await orderService.getActiveOrderByTable(tableId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "No active order for this table",
            });
        }

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};

export const getAllActiveOrdersController = async (req: Request, res: Response) => {
    try {
        const orders = await orderService.getAllActiveOrders();

        res.json({
            success: true,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body as { status: OrderStatus };

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "El estado es requerido",
            });
        }

        const order = await orderService.updateOrderStatus(orderId, status);

        res.json({
            success: true,
            message: "Estado actualizado exitosamente",
            order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: (error as Error).message,
        });
    }
};