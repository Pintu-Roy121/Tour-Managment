/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import bcrypt from "bcryptjs";
import passport, { type Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  type VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { IsActive, Role } from "../modules/user/user.interface.js";
import { User } from "../modules/user/user.model.js";
import { envVars } from "./env.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email });

        // if (!isUserExist) {
        //   return done(null, false, { message: "User does not exist!" });
        // }
        if (!isUserExist) {
          return done("User does not exist!");
        }

        if (!isUserExist.isVerified) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
          return done("User is not verified");
        }

        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE
        ) {
          // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
          return done(`User is ${isUserExist.isActive}`);
        }
        if (isUserExist.isDeleted) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
          return done("User is deleted");
        }

        const isGoogleAuthenticated = isUserExist.auths.some(
          (providerObject) => providerObject.provider === "google",
        );

        if (isGoogleAuthenticated && !isUserExist.password) {
          return done(
            "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password.",
          );
        }
        const isPasswordMatch = await bcrypt.compare(
          password,
          isUserExist.password as string,
        );

        if (!isPasswordMatch) {
          return done(null, false, { message: "Wrong Password!" });
        }

        return done(null, isUserExist);
      } catch (error) {
        done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile?.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: "No email found!" });
        }
        let user = await User.findOne({ email });

        if (user && !user.isVerified) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
          // done("User is not verified")
          return done(null, false, { message: "User is not verified" });
        }

        if (
          user &&
          (user.isActive === IsActive.BLOCKED ||
            user.isActive === IsActive.INACTIVE)
        ) {
          // throw new AppError(httpStatus.BAD_REQUEST, `User is ${user.isActive}`)
          done(`User is ${user.isActive}`);
        }

        if (user && user.isDeleted) {
          return done(null, false, { message: "User is deleted" });
          // done("User is deleted")
        }
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            role: Role.USER,
            picture: profile.photos?.[0]?.value,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }
        return done(null, user);
      } catch (error) {
        console.log("Google Strategy Error", error);
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById({ id });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
