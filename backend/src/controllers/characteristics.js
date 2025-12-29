import Characteristics from "../models/Characteristics.js";
import { getErrorMessage } from "../utils/errorUtils.js";

// GET /api/characteristics
export const getAll = async (req, res) => {
  const data = await Characteristics.find().sort({ _id: -1 });
  res.json(data);
};

// POST /api/characteristics
export const create = async (req, res) => {
  try {
    const { NameBG, NameEN, Unit, PtSchemeObjectId } = req.body;

    const item = await Characteristics.create({
      NameBG,
      NameEN,
      Unit,
      PtSchemeObjectId,
    });

    res.status(201).json(item);
  } catch (err) {
    console.log("Characteristics create error:", err);
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// PUT /api/characteristics/:id
export const update = async (req, res) => {
  try {
    const { NameBG, NameEN, Unit, PtSchemeObjectId } = req.body;

    const item = await Characteristics.findByIdAndUpdate(
      req.params.id,
      { NameBG, NameEN, Unit, PtSchemeObjectId },
      { new: true, runValidators: true }
    );

    res.json(item);
  } catch (err) {
    console.log("Characteristics update error:", err);
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// DELETE /api/characteristics/:id
export const remove = async (req, res) => {
  await Characteristics.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
