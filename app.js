//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
console.log(__dirname);
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({
  extended: true
}));
// console.log(process.env.db_connect);
app.use(session({
  secret: "Our Little Secret.", // strign jisse encryption hoga
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); // madatory
app.use(passport.session()); // mandatory

mongoose.connect(process.env.db_connect, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true); // deprication warning

const userSchema = new mongoose.Schema({ // normal ni mongoose schema banana padega
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate); //authv20 use karne ke liye nito khud ka findOrCreate code karna padega

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.client_id,
    clientSecret: process.env.client_secret,
    callbackURL: "https://infinite-shore-02990.herokuapp.com/auth/google/secrets",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo' //future proof from depricating google + api
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/error', (req, res) => {
  res.render('error');
})

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect('/login');
  }
});

app.get('/getSecrets', (req, res) => {
  if (req.isAuthenticated()) {
    const myPromise = () => {
      return new Promise((resolve, reject) => {
        User.find({
          "secret": {
            $ne: null
          }
        }, (err, foundUsers) => {
          if (err) {
            reject("Error!!");
          } else {
            if (foundUsers) {
              const resArr = foundUsers.map((item) => {
                return {
                  secret: item.secret
                };
              })
              const result = JSON.stringify(resArr);
              resolve(result);
            }
          }
        });
      });
    }

    const callPromise = async () => {
      const result = await myPromise();
      return result;
    }
    callPromise()
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        let err1 = {
          err: "Auth Error"
        }
        res.send(err1);
      });
  } else {
    let err = {
      err: "Auth Error"
    }
    res.send(JSON.stringify(err));
  }
});

app.post('/register', (req, res) => {
  if (!validateData(req.body.username, req.body.password)) {
    res.redirect('/error');
  }

  User.register({
    username: req.body.username.trim()
  }, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect('/secrets');
      });
    }
  });
});

app.post('/login', (req, res) => {

  if (!validateData(req.body.username, req.body.password)) {
    res.redirect('/error');
  }

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  // req.login(user, function(err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     passport.authenticate("local")(req, res, function() {
  //       res.redirect("/secrets");
  //     });
  //   }
  // });

  passport.authenticate('local', function(err, user, info) {
    console.log(user);
    if (err) {
      console.log(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        console.log(err);
      }
      return res.redirect('/secrets');
    });
  })(req, res);

});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile']
  })
);

app.get('/submit', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('submit');
  } else {
    res.redirect('/login');
  }
});

app.post('/submit', (req, res) => {
  console.log(req.body);
  if (req.isAuthenticated()) {
    // res.render('submit');
    let submittedSecret = '';
    if (req.body.secret.length <= 140) {
      submittedSecret = req.body.secret;
    } else {
      submittedSecret = req.body.secret.substring(0, 140);
    }
    if (submittedSecret.trim().length == 0) {
      res.redirect('/error');
    }
    console.log(req.user.id);
    const myPromise = () => {
      return new Promise((resolve, reject) => {
        User.findById(req.user.id, (err, foundUser) => {
          if (err) {
            console.log(err);
          } else {
            if (foundUser) {
              foundUser.secret = submittedSecret;
              foundUser.save(() => {
                resolve();
              })
            } else {
              reject();
            }
          }
        });
      })
    }
    const callMyPromise = async () => {
      return await myPromise();
    }

    callMyPromise()
      .then(() => {
        res.redirect('/secrets');
      })
      .catch(() => {
        res.redirect('/logout');
      });
  } else {
    res.send("error improper authentication");
    // res.redirect('/login');
  }
  // console.log(submittedSecret);
});

app.get('/auth/google/secrets',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

const validateData = (emailGet, password) => {
  const email = emailGet.trim();
  if (email.trim().length != 0 && password.length != 0) {
    if (email.match(emailReg)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

app.get("*", (req, res) => {
  res.redirect("/error");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
