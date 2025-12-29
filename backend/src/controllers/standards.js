import Standards from "../models/Standards.js";
import { getErrorMessage } from "../utils/errorUtils.js";

// GET /api/standards
export const getAll = async (req, res) => {
  const data = await Standards.find().sort({ _id: -1 });
  res.json(data);
};

// POST /api/standards
export const create = async (req, res) => {
  try {
    const { NameBG, NameEN, CharacteristicId } = req.body;

    const item = await Standards.create({
      NameBG,
      NameEN,
      CharacteristicId,
    });

    res.status(201).json(item);
  } catch (err) {
    console.log("Standards create error:", err);
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// PUT /api/standards/:id
export const update = async (req, res) => {
  try {
    const { NameBG, NameEN, CharacteristicId } = req.body;

    const item = await Standards.findByIdAndUpdate(
      req.params.id,
      { NameBG, NameEN, CharacteristicId },
      { new: true, runValidators: true }
    );

    res.json(item);
  } catch (err) {
    console.log("Standards update error:", err);
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// DELETE /api/standards/:id
export const remove = async (req, res) => {
  await Standards.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
