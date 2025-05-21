// api/auth/steam.js
const { Strategy: SteamStrategy } = require('passport-steam');
const passport = require('passport');
const express = require('express');
const session = require('express-session');

const app = express();

// Sessão — necessário para Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true }
}));
app.use(passport.initialize());
app.use(passport.session());

// Serialização
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Configura SteamStrategy
passport.use(new SteamStrategy({
    returnURL:  process.env.RETURN_URL,     // ex: https://seusite.vercel.app/api/auth/steam/return
    realm:      process.env.REALM,          // ex: https://seusite.vercel.app/
    apiKey:     process.env.STEAM_API_KEY
  },
  (identifier, profile, done) => done(null, profile)
));

// Rota que inicia o login
app.get('/api/auth/steam', passport.authenticate('steam'));

// Rota de callback da Steam
app.get('/api/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    // login ok
    res.redirect('/dashboard.html'); // ou onde quiser
  }
);

module.exports = app;
