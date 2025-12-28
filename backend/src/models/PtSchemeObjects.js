import mongoose from "mongoose";

const ptSchemeObjectSchema = new mongoose.Schema(
  {
    NameBG: { type: String, required: [true, "NameBG is required"] },
    NameEN: { type: String, required: [true, "NameEN is required"] },

    // reference to Activities collection
    ActivityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activities",
      required: [true, "Activity is required"],
    },

    // store image as Base64 string (optional)
    ImageBase64: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("PtSchemeObjects", ptSchemeObjectSchema);
