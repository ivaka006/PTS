import mongoose from "mongoose";

const subcontractorsSchema = new mongoose.Schema(
  {
    NameBG: { type: String, required: [true, "NameBG is required"] },
    NameEN: { type: String, required: [true, "NameEN is required"] },

    // store logo as Base64 (optional)
    LogoBase64: { type: String, default: "" },

    // selected PT scheme objects (from PtSchemeObjects)
    PtSchemeObjectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PtSchemeObjects",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Subcontractors", subcontractorsSchema);
