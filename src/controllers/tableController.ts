import { Request, Response } from "express";
import * as tableService from "../services/tableService";
import { asyncHandler } from "../utils/asyncHandler";
import { ControllerError } from "../utils/errors";

export const getAllTables = asyncHandler(async (_req: Request, res: Response) => {
    const tables = await tableService.getAll();
    res.json(tables);
});

export const getTableByUid = asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.params;
    const table = await tableService.getByUid(uid);
    if (!table) throw ControllerError(404, "Mesa no encontrada");
    if (table.estado === true)throw ControllerError(409, "La mesa está ocupada");
    res.json(table.nombre);
});

export const createTable = asyncHandler(async (req: Request, res: Response) => {
    const table = await tableService.create(req.body);
    res.status(201).json(table);
});

export const updateTable = asyncHandler(async (req: Request, res: Response) => {
    const updated = await tableService.update(req.params.id, req.body);
    if (!updated) throw ControllerError(404, "Mesa no encontrada");
    res.json(updated);
});

export const deleteTable = asyncHandler(async (req: Request, res: Response) => {
    const deleted = await tableService.remove(req.params.id);
    if (!deleted) throw ControllerError(404, "Mesa no encontrada");
    res.json({ message: "Mesa eliminada correctamente" });
});

export const callWaiter = asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.params;
    const table = await tableService.requestWaiter(uid);
    if (!table) throw ControllerError(404, "Mesa no encontrada o inactiva");
    
    res.json({ success: true, message: "Camarero solicitado correctamente" });
});

export const requestBill = asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.params;
    const table = await tableService.requestBill(uid);
    if (!table) throw ControllerError(404, "Mesa no encontrada o inactiva");
    
    res.json({ success: true, message: "Cuenta solicitada correctamente" });
});

export const clearTableAlerts = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await tableService.clearAlerts(id);
    if (!updated) throw ControllerError(404, "Mesa no encontrada");
    
    res.json({ success: true, message: "Alertas limpiadas", table: updated });
});