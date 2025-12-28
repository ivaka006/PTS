import express from "express";
import { getAll, create, update, remove } from "../controllers/activities.js";
import { getAll as getAllPt, create as createPt, update as updatePt, remove as removePt } from "../controllers/ptschemeobjects.js";

const router = express.Router();

// Activities
router.get("/activities", getAll);
router.post("/activities", create);
router.put("/activities/:id", update);
router.delete("/activities/:id", remove);

// PtSchemeObjects
router.get("/ptschemeobjects", getAllPt);
router.post("/ptschemeobjects", createPt);
router.put("/ptschemeobjects/:id", updatePt);
router.delete("/ptschemeobjects/:id", removePt);

export default router;
