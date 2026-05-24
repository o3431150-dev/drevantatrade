// routes/tradeRoutes.js
import express from "express";
import { tradeController } from "../controllers/tradeController.js";
//import { authenticate, isAdmin } from "../middleware/auth.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const tradeRouter = express.Router();

// All routes require authentication
tradeRouter.use(protect);

// Order Management
tradeRouter.post("/place", tradeController.placeOrder);
tradeRouter.get("/active", tradeController.getActiveOrders);
tradeRouter.get("/completed", tradeController.getCompletedOrders);

tradeRouter.get("/balance", tradeController.getBalance);

tradeRouter.get("/:orderId", tradeController.getOrderById);
tradeRouter.post("/:orderId/cancel", tradeController.cancelOrder);

// Statistics & Balance
///tradeRouter.get("/stats/summary", tradeController.getTradingStats);

// Guard subsequent routes to Admin and Support roles only
tradeRouter.use(authorize('admin', 'support'));

// Admin Control Routes
tradeRouter.post("/admin/force-win/:userId", tradeController.toggleForceWin);
tradeRouter.post("/admin/process-expired", tradeController.processExpiredOrders);

// New Secure Admin Order Management Endpoints
tradeRouter.get("/admin/all-orders", tradeController.getAllOrdersAdmin);
tradeRouter.delete("/admin/clear-completed", tradeController.deleteCompletedOrdersAdmin);

export default tradeRouter;