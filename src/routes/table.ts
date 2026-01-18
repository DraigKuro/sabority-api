import { Router } from "express";
import * as tableController from "../controllers/tableController";

const router = Router();

router.get("/uid/:uid", tableController.getTableByUid);
router.patch("/uid/:uid/call-waiter", tableController.callWaiter);
router.patch("/uid/:uid/request-bill", tableController.requestBill);

router.get("/", tableController.getAllTables);
router.post("/", tableController.createTable);

router.put("/:id", tableController.updateTable);
router.delete("/:id", tableController.deleteTable);
router.patch("/:id/clear-alerts", tableController.clearTableAlerts);

export default router;
