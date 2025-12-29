import Quantities from "../models/Quantities.js";
import { getErrorMessage } from "../utils/errorUtils.js";

// GET /api/quantities
export const getAll = async (req, res) => {
  const data = await Quantities.find().sort({ _id: -1 });
  res.json(data);
};

// POST /api/quantities
export const create = async (req, res) => {
  try {
    const { NameBG, NameEN, Unit, PtSchemeObjectId } = req.body;

    const item = await Quantities.create({
      NameBG,
      NameEN,
      Unit,
      PtSchemeObjectId,
    });

    res.status(201).json(item);
  } catch (err) {
    console.log("Quantities create error:", err);
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// PUT /api/quantities/:id
export const update = async (req, res) => {
  try {
    const { NameBG, NameEN, Unit, PtSchemeObjectId } = req.body;

    const item = await Quantities.findByIdAndUpdate(
      req.params.id,
      { NameBG, NameEN, Unit, PtSchemeObjectId },
      { new: true, runValidators: true }
    );

    res.json(item);
  } catch (err) {
    console.log("Quantities update error:", err);
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// DELETE /api/quantities/:id
export const remove = async (req, res) => {
  await Quantities.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
