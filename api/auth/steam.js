// api/auth/steam.js

const express       = require('express');
const session       = require('express-session');
const passport      = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const serverless    = require('serverless-http');

const app = express();

// —– configurações Express & Passport —–

// Session (necessário para o fluxo do Passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true }
}));

// Inicializa Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialização do usuário
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Configura a estratégia Steam
passport.use(new SteamStrategy({
    returnURL: process.env.RETURN_URL,   // ex: https://seu-backend.vercel.app/api/auth/steam/return
    realm:     process.env.REALM,        // ex: https://seu-backend.vercel.app/
    apiKey:    process.env.STEAM_API_KEY
  },
  (identifier, profile, done) => {
    // Aqui você pode salvar/atualizar o usuário no DB, se quiser
    return done(null, profile);
  }
));

// Rota que inicia o login na Steam
app.get('/api/auth/steam',
  passport.authenticate('steam')
);

// Rota de callback da Steam
app.get('/api/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    // Autenticação bem-sucedida → redireciona ao dashboard
    res.redirect('/dashboard.html');
  }
);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('🚨 ERRO NO SERVERLESS:', err);
  res.status(500).send('Erro interno — confira os logs do Vercel');
});

// Exporta como handler Serverless
module.exports = serverless(app);
