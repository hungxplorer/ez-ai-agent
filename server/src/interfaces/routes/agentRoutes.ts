import { Router } from "express";
import { AgentController } from "~/interfaces/routes/../controllers/AgentController";
import {
  validateAgentCreate,
  validateAgentUpdate,
} from "../validators/agentValidators";

const router = Router();
const agentController = new AgentController();

// GET /api/agents - Get all agents
router.get("/", agentController.getAllAgents);

// GET /api/agents/:id - Get agent by ID
router.get("/:id", agentController.getAgentById);

// POST /api/agents - Create new agent
router.post("/", validateAgentCreate, agentController.createAgent);

// PUT /api/agents/:id - Update agent
router.put("/:id", validateAgentUpdate, agentController.updateAgent);

// DELETE /api/agents/:id - Delete agent
router.delete("/:id", agentController.deleteAgent);

// POST /api/agents/:id/execute - Execute agent with prompt
router.post("/:id/execute", agentController.executeAgent);

export const agentRoutes = router;
