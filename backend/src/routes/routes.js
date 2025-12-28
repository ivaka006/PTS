import express from "express";
import { getAll, create, update, remove } from "../controllers/activities.js";

const router = express.Router();

router.get("/activities", getAll);
router.post("/activities", create);
router.put("/activities/:id", update);
router.delete("/activities/:id", remove);

export default router;
