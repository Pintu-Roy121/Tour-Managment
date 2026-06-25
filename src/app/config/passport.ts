/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import passport, { type Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  type VerifyCallback,
} from "passport-google-oauth20";
import { Role } from "../modules/user/user.interface.js";
import { User } from "../modules/user/user.model.js";
import { envVers } from "./env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: envVers.GOOGLE_CLIENT_ID,
      clientSecret: envVers.GOOGLE_CLIENT_SECRET,
      callbackURL: envVers.GOOGLE_CALLBACK_URL,
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
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            role: Role.USER,
            picture: profile.photos?.[0]?.value,
            isVerified: true,
            auths: [
              {
                provider: "Google",
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
