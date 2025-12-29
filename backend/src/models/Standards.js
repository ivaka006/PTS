import mongoose from "mongoose";

const standardsSchema = new mongoose.Schema(
  {
    NameBG: { type: String, required: [true, "NameBG is required"] },
    NameEN: { type: String, required: [true, "NameEN is required"] },

    CharacteristicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Characteristics",
      required: [true, "Characteristic is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Standards", standardsSchema);
