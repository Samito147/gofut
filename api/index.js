const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

const app = express();

// 🛡️ Sessão segura
app.use(session({
  secret: process.env.SESSION_SECRET, // variável de ambiente
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// 🔑 Serialização do usuário
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 🔗 Configurar SteamStrategy
passport.use(new SteamStrategy({
    returnURL: process.env.RETURN_URL,        // ex: https://seusite.com/api/auth/steam/return
    realm:     process.env.REALM,             // ex: https://seusite.com/
    apiKey:    process.env.STEAM_API_KEY      // sua Steam API Key
  },
  (identifier, profile, done) => {
    // Aqui você pode salvar ou atualizar o usuário no seu DB
    return done(null, profile);
  }
));

// ▶️ Rota de início de login
app.get('/auth/steam',
  passport.authenticate('steam'),
  (req, res) => { /* redireciona para Steam */ }
);

// ↪️ Rota de retorno (callback)
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    // Login OK → redireciona para sua página (ex: dashboard)
    res.redirect('/');
  }
);

// 📝 Iniciar servidor (para testes locais)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
}

module.exports = app; // para serverless
