import { Schema, model } from "mongoose";

const activitiesSchema = new Schema({
    NameBG: { type: String, required: [true, "Наименование is required"] },
    NameЕN: { type: String, required: [true, "Name is required"] },
})

export default model("Activities", activitiesSchema);