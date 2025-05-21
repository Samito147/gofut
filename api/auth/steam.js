// api/auth/steam.js

const express       = require('express');
const path          = require('path');
const session       = require('express-session');
const passport      = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// 📂 Serve os arquivos estáticos (menu.html, CSS, dashboard.html etc.)
//    Ajuste o caminho para a pasta raiz do seu site
app.use('/', express.static(path.resolve(__dirname, '..', '..')));

// 📦 Sessão para o Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// 🔄 Serialize / Deserialize do usuário
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 🎮 Estratégia Steam OpenID
passport.use(new SteamStrategy({
    returnURL: 'https://gofut-app.herokuapp.com/auth/steam/return',
    realm:     'https://gofut-app.herokuapp.com/',
    apiKey:    process.env.STEAM_API_KEY
  },
  (identifier, profile, done) => done(null, profile)
));

// ▶️ Inicia o login: GET /auth/steam
app.get('/auth/steam',
  passport.authenticate('steam')
);

// ↩️ Callback da Steam: GET /auth/steam/return
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    // Login bem-sucedido ➡️ redireciona para o dashboard
    res.redirect('/dashboard.html');
  }
);

// 🏠 Redireciona raiz → menu.html
app.get('/', (req, res) => {
  res.redirect('/menu.html');
});

// 🛑 Tratamento de erros
app.use((err, req, res, next) => {
  console.error('🚨 ERRO NA STEAM AUTH:', err);
  res.status(500).send('Erro interno — verifique os logs');
});

// 🚀 Inicia o servidor
app.listen(PORT, () => {
  console.log(`🔥 SteamAuth rodando em http://localhost:${PORT} e https://gofut-app.herokuapp.com`);
});
