// src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";

const BASE = process.env.BASE_URL || "http://localhost:4000";


const primaryEmail = (profile) => {
  const e = profile?.emails?.[0]?.value;
  return e ? String(e).trim().toLowerCase() : null;
};


const primaryPhoto = (profile) => profile?.photos?.[0]?.value || "";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE}/api/v1/auth/google/callback`,

    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = primaryEmail(profile);
        const providerId = profile.id;

        const query = email
          ? { $or: [{ email }, { provider: "google", providerId }] }
          : { provider: "google", providerId };

        const update = {
          $setOnInsert: {
            username: profile.displayName || "Google User",
            email: email || undefined, 
            provider: "google",
            providerId,
            avatar: primaryPhoto(profile),
            createdAt: new Date(),
          },
          $set: {
            lastLogin: new Date(),
            avatar: primaryPhoto(profile) || undefined,
          },
        };

      
        const options = { new: true, upsert: true };
        const user = await User.findOneAndUpdate(query, update, options);

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);


passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${BASE}/api/v1/auth/facebook/callback`,
      profileFields: ["id", "displayName", "emails", "photos"], 
      enableProof: true,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
      
        const email = primaryEmail(profile); 
        const providerId = profile.id;

        
        const query = email
          ? { $or: [{ email }, { provider: "facebook", providerId }] }
          : { provider: "facebook", providerId };

        const update = {
          $setOnInsert: {
            username: profile.displayName || "Facebook User",
            email: email || undefined,
            provider: "facebook",
            providerId,
            avatar: primaryPhoto(profile),
            createdAt: new Date(),
          },
          $set: {
            lastLogin: new Date(),
            avatar: primaryPhoto(profile) || undefined,
          },
        };

        const options = { new: true, upsert: true };
        const user = await User.findOneAndUpdate(query, update, options);

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);


export default passport;
