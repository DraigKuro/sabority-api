import { Router } from "express";
import * as orderController from "../controllers/orderController";

const router = Router();

router.post("/", orderController.createOrderController);

router.get("/active", orderController.getAllActiveOrdersController); 
router.get("/table/:tableId/active", orderController.getActiveOrderByTableController);
router.get("/table/:tableId", orderController.getOrdersByTableController);

router.get("/:orderId", orderController.getOrderByIdController);
router.patch("/:orderId/status", orderController.updateOrderStatusController);

export default router;
