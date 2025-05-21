// api/auth/steam.js

const express       = require('express');
const session       = require('express-session');
const passport      = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const serverless    = require('serverless-http');

const app = express();

// Sessão para Passport
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

// SteamStrategy
passport.use(new SteamStrategy({
    returnURL: process.env.RETURN_URL,  // ex: https://<seu-domínio>/api/auth/steam/return
    realm:     process.env.REALM,       // ex: https://<seu-domínio>/
    apiKey:    process.env.STEAM_API_KEY
  },
  (identifier, profile, done) => done(null, profile)
));

// Inicia o login (GET /api/auth/steam)
app.get('/', passport.authenticate('steam'));

// Callback (GET /api/auth/steam/return)
app.get('/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    // sucesso → redireciona
    res.redirect('/dashboard.html');
  }
);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('🚨 ERRO NA STEAM FUNCTION:', err);
  res.status(500).send('Erro interno — verifique os logs');
});

module.exports = serverless(app);
