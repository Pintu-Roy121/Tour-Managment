import bcrypt from "bcryptjs";
import { envVars } from "../config/env.js";
import {
  Role,
  type IAuthProvider,
  type IUser,
} from "../modules/user/user.interface.js";
import { User } from "../modules/user/user.model.js";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log("Super Admin already exist");
      return;
    }

    const hashPassword = await bcrypt.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND),
    );

    const authProvider: IAuthProvider = {
      provider: "Credential",
      providerId: envVars.SUPER_ADMIN_EMAIL,
    };

    const payload: IUser = {
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashPassword,
      isVerified: true,
      auths: [authProvider],
    };

    const superAdmin = await User.create(payload);
    console.log("Super admin created successful");
    console.log(superAdmin);
  } catch (error) {
    console.log(error);
  }
};
