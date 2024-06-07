const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook");
const snaptrade = require("./helper/snapTrade");

const User = require("./Models/users"); // Assuming you have a User model

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REFIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);
        let user = await User.findOne({ gmailToken: profile.id });
        if (!user) {
          // const response = await snaptrade.authentication.registerSnapTradeUser(
          //   {
          //     userId: profile.emails[0].value,
          //   }
          // );
          user = new User({
            gmailToken: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value,
            emailVerify: true,
            // snaptradeSec: response.data.userSecret,
          });
          console.log(user);
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_APP_CALLBACK,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({ facebookToken: profile.id });
        if (!user) {
          user = new User({
            appleToken: profile.id,
            name: profile.displayName,
            email: profile.email,
            emailVerify: true,
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
