// passport-config.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Replace this with your user data structure (in-memory for learning purposes)
const users = [
  {
    id: 1,
    username: 'alice',
    password: '$2b$10$g3H3NBOQOk6CO6TKKbPpru5V/T92OeW0a5cI/EEyM3EM.6Ro3i77R6', // hashed 'password'
  },
  // Add more user objects as needed
];

passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = users.find((user) => user.username === username);

    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return done(err);
      }

      if (!result) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((user) => user.id === id);
  done(null, user);
});

module.exports = passport;
