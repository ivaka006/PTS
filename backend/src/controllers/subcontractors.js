import Subcontractors from "../models/Subcontractors.js";
import { getErrorMessage } from "../utils/errorUtils.js";

// GET /api/subcontractors
export const getAll = async (req, res) => {
  const data = await Subcontractors.find().sort({ _id: -1 });
  res.json(data);
};

// POST /api/subcontractors
export const create = async (req, res) => {
  try {
    const { NameBG, NameEN, LogoBase64, PtSchemeObjectIds } = req.body;

    const item = await Subcontractors.create({
      NameBG,
      NameEN,
      LogoBase64: LogoBase64 || "",
      PtSchemeObjectIds: Array.isArray(PtSchemeObjectIds) ? PtSchemeObjectIds : [],
    });

    res.status(201).json(item);
  } catch (err) {
    console.log("Subcontractors create error:", err);
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// PUT /api/subcontractors/:id
export const update = async (req, res) => {
  try {
    const { NameBG, NameEN, LogoBase64, PtSchemeObjectIds } = req.body;

    const payload = {
      NameBG,
      NameEN,
      PtSchemeObjectIds: Array.isArray(PtSchemeObjectIds) ? PtSchemeObjectIds : [],
    };

    // only overwrite logo if sent (so edit without new logo keeps the old one)
    if (typeof LogoBase64 === "string") payload.LogoBase64 = LogoBase64;

    const item = await Subcontractors.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.json(item);
  } catch (err) {
    console.log("Subcontractors update error:", err);
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// DELETE /api/subcontractors/:id
export const remove = async (req, res) => {
  await Subcontractors.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
