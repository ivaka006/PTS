import PtSchemeObjects from "../models/PtSchemeObjects.js";
import { getErrorMessage } from "../utils/errorUtils.js";

// GET /api/ptschemeobjects
export const getAll = async (req, res) => {
  const data = await PtSchemeObjects.find().sort({ _id: -1 });
  res.json(data);
};

// POST /api/ptschemeobjects
export const create = async (req, res) => {
  try {
    const { NameBG, NameEN, ActivityId, ImageBase64 } = req.body;

    const item = await PtSchemeObjects.create({
      NameBG,
      NameEN,
      ActivityId,
      ImageBase64: ImageBase64 || "",
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// PUT /api/ptschemeobjects/:id
export const update = async (req, res) => {
  try {
    const { NameBG, NameEN, ActivityId, ImageBase64 } = req.body;

    const item = await PtSchemeObjects.findByIdAndUpdate(
      req.params.id,
      {
        NameBG,
        NameEN,
        ActivityId,
        ...(typeof ImageBase64 === "string" ? { ImageBase64 } : {}),
      },
      { new: true, runValidators: true }
    );

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

// DELETE /api/ptschemeobjects/:id
export const remove = async (req, res) => {
  await PtSchemeObjects.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
