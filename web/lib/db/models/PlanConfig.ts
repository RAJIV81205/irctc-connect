import mongoose, { InferSchemaType, Model } from "mongoose";

const planFeatureSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const pricingPlanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [planFeatureSchema],
      default: [],
    },
    planType: {
      type: String,
      enum: ["free", "pro", "advance"],
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
      trim: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    colorTheme: {
      type: String,
      enum: ["blue", "slate", "emerald"],
      required: true,
    },
    limit: {
      type: Number,
      default: 0,
      min: 0,
    },
    userPlan: {
      type: String,
      enum: ["pro", "enterprise", null],
      default: null,
    },
  },
  { _id: false }
);

const planConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
      trim: true,
    },
    offerEndsAt: {
      type: Date,
      default: null,
    },
    contactEmail: {
      type: String,
      default: "lucky81205+irctc@gmail.com",
      trim: true,
    },
    plans: {
      type: [pricingPlanSchema],
      default: [],
      validate: {
        validator: (value: unknown[]) => Array.isArray(value) && value.length > 0,
        message: "At least one pricing plan is required",
      },
    },
  },
  { timestamps: true }
);

export type PlanConfigDocument = InferSchemaType<typeof planConfigSchema> & {
  _id: mongoose.Types.ObjectId;
};

const PlanConfig =
  (mongoose.models.PlanConfig as Model<PlanConfigDocument>) ||
  mongoose.model<PlanConfigDocument>("PlanConfig", planConfigSchema);

export default PlanConfig;
