import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA - Matches PRD Section 5 (Schema Structure)
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    // Auth providers used by this user (google, email)
    authProviders: {
      type: [String],
      default: [],
    },
    // Usage tracking for rate limiting (20 req/day per tool)
    usage: {
      metadataInspector: {
        count: { type: Number, default: 0 },
        lastResetDate: { type: Date, default: Date.now },
      },
      commentExplorer: {
        count: { type: Number, default: 0 },
        lastResetDate: { type: Date, default: Date.now },
      },
      toolRequests: {
        count: { type: Number, default: 0 },
        lastResetDate: { type: Date, default: Date.now },
      },
    },
    // User preferences (settings page)
    preferences: {
      exportFormat: {
        type: String,
        enum: ["csv", "xlsx", "json"],
        default: "csv",
      },
      dateFormat: {
        type: String,
        enum: ["us", "eu", "iso"],
        default: "iso",
      },
      timezone: {
        type: String,
        enum: ["utc", "local", "pst", "est", "cet"],
        default: "utc",
      },
      notifications: {
        toolCompletion: { type: Boolean, default: true },
        newFeatures: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      analyticsOptIn: { type: Boolean, default: true },
    },
    // Tool IDs the user has registered interest in (coming-soon tools)
    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default (mongoose.models.User || mongoose.model("User", userSchema)) as mongoose.Model<any>;
