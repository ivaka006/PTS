import Activities from "../models/Activities.js";
import { getErrorMessage } from "../utils/errorUtils.js";

export const getAll = async (req, res) => {
  const data = await Activities.find().sort({ _id: -1 });
  res.json(data);
};

export const create = async (req, res) => {
  try {
    const { NameBG, NameЕN } = req.body;
    const item = await Activities.create({ NameBG, NameЕN });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

export const update = async (req, res) => {
  try {
    const { NameBG, NameЕN } = req.body;
    const item = await Activities.findByIdAndUpdate(
      req.params.id,
      { NameBG, NameЕN },
      { new: true, runValidators: true }
    );
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: getErrorMessage(err) });
  }
};

export const remove = async (req, res) => {
  await Activities.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
