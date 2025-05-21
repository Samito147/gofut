// api/auth/steam.js
const express       = require('express');
const session       = require('express-session');
const passport      = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// Sessão necessária pro Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// Serialize / Deserialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Configura Steam OpenID
passport.use(new SteamStrategy({
    returnURL:  `${process.env.BASE_URL}/auth/steam/return`,
    realm:      process.env.BASE_URL,
    apiKey:     process.env.STEAM_API_KEY
  },
  (identifier, profile, done) => done(null, profile)
));

// Rotas Express
app.get('/auth/steam', passport.authenticate('steam'));
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => res.redirect('/dashboard.html')
);

app.listen(PORT, () => console.log(`Servidor SteamAuth rodando em ${PORT}`));
