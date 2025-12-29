import express from "express";
import { getAll, create, update, remove } from "../controllers/activities.js";
import { getAll as getAllPt, create as createPt, update as updatePt, remove as removePt } from "../controllers/ptschemeobjects.js";
import { getAll as getAllCh, create as createCh, update as updateCh, remove as removeCh } from "../controllers/characteristics.js";
import { getAll as getAllSt, create as createSt, update as updateSt, remove as removeSt } from "../controllers/standards.js";
import { getAll as getAllQ, create as createQ, update as updateQ, remove as removeQ } from "../controllers/quantities.js";
import { getAll as getAllSub, create as createSub, update as updateSub, remove as removeSub } from "../controllers/subcontractors.js";

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

// Characteristics
router.get("/characteristics", getAllCh);
router.post("/characteristics", createCh);
router.put("/characteristics/:id", updateCh);
router.delete("/characteristics/:id", removeCh);

// Standards
router.get("/standards", getAllSt);
router.post("/standards", createSt);
router.put("/standards/:id", updateSt);
router.delete("/standards/:id", removeSt);
// Quantities
router.get("/quantities", getAllQ);
router.post("/quantities", createQ);
router.put("/quantities/:id", updateQ);
router.delete("/quantities/:id", removeQ);

// Subcontractors
router.get("/subcontractors", getAllSub);
router.post("/subcontractors", createSub);
router.put("/subcontractors/:id", updateSub);
router.delete("/subcontractors/:id", removeSub);

export default router;
