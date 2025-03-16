import { Router } from "express";
import { agentRoutes } from "./agentRoutes";
import { DynamicAgentController } from "~/interfaces/controllers/DynamicAgentController";
import { logger } from "~/infrastructure/logging/logger";

const router = Router();
const dynamicAgentController = new DynamicAgentController();

// API routes
router.use("/agents", agentRoutes);

// Dynamic agent route - This will be a fallback for any unmatched routes
// Note: Dynamic routes from the database will be registered separately in the dynamicRoutesMiddleware
logger.info("Registering fallback route for dynamic agents");
router.post("*", dynamicAgentController.executeAgentByPath);

// Add more routes here as needed
// router.use('/users', userRoutes);

export const apiRoutes = router;
