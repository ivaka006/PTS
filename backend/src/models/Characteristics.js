import mongoose from "mongoose";

const characteristicsSchema = new mongoose.Schema(
  {
    NameBG: { type: String, required: [true, "NameBG is required"] },
    NameEN: { type: String, required: [true, "NameEN is required"] },
    Unit: { type: String, required: [true, "Unit is required"] },

    // link to PtSchemeObjects
    PtSchemeObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PtSchemeObjects",
      required: [true, "Object is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Characteristics", characteristicsSchema);
