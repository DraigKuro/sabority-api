import { Table, TableDocument } from "../models/table";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";
import { ServiceError } from "../utils/errors";

export const getAll = async (): Promise<TableDocument[]> => {
    try {
        return await Table.find({ deletedAt: null });
    } catch (err) {
        throw ServiceError("Error al obtener las mesas");
    }
};

export const getByUid = async (uid: string): Promise<TableDocument | null> => {
    try {
        const table = await Table.findOne({ uid, deletedAt: null });
        return table;
    } catch (err) {
        throw ServiceError("Error al obtener la mesa por UID");
    }
};

export const create = async (data: Partial<TableDocument>): Promise<TableDocument> => {
    try {
        const uid = uuidv4();
        const qrUrl = uid;

        const table = new Table({
            ...data,
            uid,
            qrUrl,
            estado: data.estado ?? false,
        });

        return await table.save();
    } catch (err) {
        throw ServiceError("Error al crear la mesa");
    }
};

export const update = async (id: string, data: Partial<TableDocument>): Promise<TableDocument | null> => {
    try {
        const { uid, qrUrl, ...updateData } = data;

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return updatedTable;
    } catch (err) {
        throw ServiceError("Error al actualizar la mesa");
    }
};

export const remove = async (id: string): Promise<TableDocument | null> => {
    try {
        if (!Types.ObjectId.isValid(id)) return null;
        return await Table.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    } catch (err) {
        throw ServiceError("Error al eliminar la mesa");
    }
};

export const requestWaiter = async (uid: string): Promise<TableDocument | null> => {
    try {
        return await Table.findOneAndUpdate(
            { uid, activo: true, deletedAt: null },
            { peticionCamarero: true },
            { new: true }
        );
    } catch (err) {
        throw ServiceError("Error al solicitar camarero");
    }
};

export const requestBill = async (uid: string): Promise<TableDocument | null> => {
    try {
        return await Table.findOneAndUpdate(
            { uid, activo: true, deletedAt: null },
            { peticionCuenta: true },
            { new: true }
        );
    } catch (err) {
        throw ServiceError("Error al solicitar la cuenta");
    }
};

export const clearAlerts = async (id: string): Promise<TableDocument | null> => {
    try {
        if (!Types.ObjectId.isValid(id)) return null;
        return await Table.findByIdAndUpdate(
            id,
            { peticionCamarero: false, peticionCuenta: false },
            { new: true }
        );
    } catch (err) {
        throw ServiceError("Error al limpiar las alertas de la mesa");
    }
};