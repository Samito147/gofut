// index.js

const express       = require('express');
const session       = require('express-session');
const passport      = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const path          = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir seus arquivos estáticos (menu.html, CSS, etc.)
app.use(express.static(path.join(__dirname)));

// Sessão
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new SteamStrategy({
    returnURL:  'https://gofut-app.herokuapp.com/auth/steam/return',
    realm:      'https://gofut-app.herokuapp.com/',
    apiKey:     process.env.STEAM_API_KEY
  },
  (identifier, profile, done) => done(null, profile)
));

// Rotas Steam
app.get('/auth/steam', passport.authenticate('steam'));
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => res.redirect('/dashboard.html')
);

// Raiz → menu.html
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'menu.html')));

app.listen(PORT, () => {
  console.log(`🚀 App rodando em porta ${PORT}`);
});
