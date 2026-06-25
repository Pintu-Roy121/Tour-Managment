import { model, Schema } from "mongoose";
import { boolean } from "zod";
import {
  IsActive,
  Role,
  type IAuthProvider,
  type IUser,
} from "./user.interface.js";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false, versionKey: false },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: boolean, default: false },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    auths: [authProviderSchema],
  },
  { timestamps: true, versionKey: false },
);

export const User = model<IUser>("User", userSchema);
