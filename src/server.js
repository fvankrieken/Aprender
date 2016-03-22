var express = require('express')
  , mailer = require('express-mailer')
  , passport = require('passport')
  , flash = require('connect-flash')
  , utils = require('./utils')
  , LocalStrategy = require('passport-local').Strategy
  , RememberMeStrategy = require('../node_modules/passport-remember-me').Strategy
  , CookieParser = require('cookie-parser')
  , BodyParser = require('body-parser')
  , morgan = require('morgan')
  , MethodOverride = require('method-override')
  , session = require('express-session')
  , multer = require('multer')
  , fs = require('fs')
  , MongoClient = require('mongodb').MongoClient
  , MongoURL = 'mongodb://aprenderconinteres.org:27017/data'

var db;

// Initialize connection once
MongoClient.connect(MongoURL, function(err, database) {
  if(err) throw err;

  db = database;

  // Start the application after the database connection is ready
  app.listen(app.get('port'), function() {
  console.log('Express server listening on port', app.get('port'));
  });
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/pdfs')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })

var users = [
    { id: 1, username: 'admin', password: 'sociedadcivil'}
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

/* Fake, in-memory database of remember me tokens */

var tokens = {}

function consumeRememberMeToken(token, fn) {
  var uid = tokens[token];
  // invalidate the single-use token
  delete tokens[token];
  return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
  tokens[token] = uid;
  return fn();
}



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

// Remember Me cookie strategy
//   This strategy consumes a remember me token, supplying the user the
//   token was originally issued to.  The token is single-use, so a new
//   token is then issued to replace it.
passport.use(new RememberMeStrategy(
  function(token, done) {
    consumeRememberMeToken(token, function(err, uid) {
      if (err) { return done(err); }
      if (!uid) { return done(null, false); }
      
      findById(uid, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
      });
    });
  },
  issueToken
));

function issueToken(user, done) {
  var token = utils.randomString(64);
  saveRememberMeToken(token, user.id, function(err) {
    if (err) { return done(err); }
    return done(null, token);
  });
}

var app = express();

mailer.extend(app, {
  from: 'consultasaprenderconinteres@gmail.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'consultasaprenderconinteres@gmail.com',
    pass: 'sociedadcivil'
  }
});

app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');
app.set('port', 80)
app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.use(CookieParser());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(MethodOverride());
app.use(session({
  secret: 'laser horse'
}))
app.use(flash());
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

app.locals.blueHeight = function(subject) {
  var gridLength = Math.ceil(subject.length/3.)-2;
  var toReturn = (gridLength * 239) + 155;
  if (gridLength < 0) {return 40};
  return toReturn;
}

app.locals.slickBlank = {'title': '', 'pathName': '', 'comps': [], 'temas': [], 'descript': ''}

app.get('/', function(req, res){
  var collection = db.collection('slick');
  var slickArray = []
  var toAdd

  collection.find().toArray(function(err, documents) {
    console.dir(documents);
  });

  collection.find({ 'cont': 'Esp' }).toArray(function(err, documents) {
    toAdd = documents[0];
    if (toAdd) {
      slickArray.push(toAdd)
    }
    collection.find({ 'cont': 'Mat' }).toArray(function(err, documents) {
      toAdd = documents[0];
      if (toAdd) {
        slickArray.push(toAdd)
      }
      collection.find({ 'cont': 'Cie' }).toArray(function(err, documents) {
        toAdd = documents[0];
        if (toAdd) {
          slickArray.push(toAdd)
        }
        collection.find({ 'cont': 'His' }).toArray(function(err, documents) {
          toAdd = documents[0];
          if (toAdd) {
            slickArray.push(toAdd)
          }
          collection.find({ 'cont': 'Tex' }).toArray(function(err, documents) {
            toAdd = documents[0];
            if (toAdd) {
              slickArray.push(toAdd)
            }

            res.render('index', { 'slicks': slickArray});
            
          });
        });
      });
    });
  });
});

app.get('/RelacionTutoria', function(req, res){
  res.render('RT', { isAdmin: (req.isAuthenticated())});
});

app.get('/MapeoVirtual', function(req, res){
  res.render('MV', { isAdmin: (req.isAuthenticated())});
});

app.get('/CatalogoDeOfertas', function(req, res){
  var collection = db.collection('temas');
  var catJSON = {};

  collection.find({ 'cont': 'Esp' }).toArray(function(err, documents) {
    if (!documents) {
      catJSON.esp = [];
    } else {
      catJSON.esp = documents;
    }

    collection.find({ 'cont': 'Mat' }).toArray(function(err, documents) {
      if (!documents) {
        catJSON.mat = [];
      } else {
        catJSON.mat = documents;
      }

      collection.find({ 'cont': 'Cie' }).toArray(function(err, documents) {
        if (!documents) {
          catJSON.cie = [];
        } else {
          catJSON.cie = documents;
        }

        collection.find({ 'cont': 'His' }).toArray(function(err, documents) {
          if (!documents) {
            catJSON.his = [];
          } else {
            catJSON.his = documents;
          }

          collection.find({ 'cont': 'Tex' }).toArray(function(err, documents) {
            if (!documents) {
              catJSON.tex = [];
            } else {
              catJSON.tex = documents;
            }

            catJSON.isAdmin = req.isAuthenticated();

            res.render('CdO', catJSON);
            
          });
        });
      });
    });
  });
});

app.get('/CatalogoDeOfertas/*', function(req, res){
  var patharray = req.path.split('/')
  var pathName = patharray[patharray.length-1];
  collection = db.collection('temas')

  collection.find({ 'pathName': pathName }).toArray(function(err, pathDataArray) {
    pathData = pathDataArray[0]
    if (!pathData) {
      res.render('error')
      return
    }
    pathData['isAdmin'] = req.isAuthenticated()
    res.render('template', pathData);
  })
  
 
});

app.post('/CatalogoDeOfertas/*', function(req, res){
  var id = utils.randomString(4);
  var expEmail = req.body.expEmail;
  var email = req.body.email;
  var question = req.body.question;
  var subject = req.body.subject;
  var page = req.path.split('/')[2];


  var collection = db.collection('emails');
  
  var toInsert = { 'id': id, 'email': email, 'expEmail': expEmail, 'subject': subject};

  collection.insert(
    toInsert, 
    app.mailer.send('email', 
      {
        to: expEmail,
        subject: subject + ', de: ' + email,
        id: id,
        content: question,
        expOrNot: 'exp'
      }, function (err) {
        if (err) {
          // handle error
          console.log(err);
          res.send('There was an error sending the email');
          return;
        }
        res.send('Enviado');
        return;
      })
  );
});

app.get('/edit/*', ensureAuthenticated, function(req, res){
  var patharray = req.path.split('/')
  var pathName = patharray[patharray.length-1];
  collection = db.collection('temas')

  collection.find({ 'pathName': pathName }).toArray(function(err, pathDataArray) {
    pathData = pathDataArray[0]
    if (!pathData) {
      res.render('error')
      return
    }
    res.render('editTemplate', pathData);
  });
});

app.post('/edit/*', ensureAuthenticated, function(req, res){
  var uploadInfo = req.body;
  var collection = db.collection('temas');
  var OGpathName = uploadInfo.OGpathName
  var title = uploadInfo.title;
  var tempName = utils.toTitleCase(title)
  var tempName2 = tempName.replace(/\s/g, '');
  var pathName = utils.removeDiacritics(tempName2).replace(/\W/g, '');

  var comps = uploadInfo.comps.split(', ');
  var temas = uploadInfo.temas.split(', ');

  var toInsert = {'pathName': pathName, 'title': title, 'descript': uploadInfo.descript, 'cont': uploadInfo.Cont, 'comps': comps, 'temas': temas, 
  'email': uploadInfo.email, 'fileName': req.body.fileName}

  collection.findOneAndUpdate({'pathName': OGpathName}, toInsert, function(err, count) {
    var slickCollect = db.collection('slick');

    slickCollect.findOneAndUpdate({'pathName': pathName}, toInsert, function(err, count) {
      res.redirect('/CatalogoDeOfertas/'+pathName);
    });
  });
});

app.get('/delete/*', ensureAuthenticated, function(req, res) {
  var patharray = req.path.split('/');
  var pathName = patharray[patharray.length-1];
  collection = db.collection('temas');
  collection.deleteOne({'pathName': pathName});
  slickCollect = db.collection('slick');
  slickCollect.deleteOne({'pathName': pathName})
  res.redirect('/CatalogoDeOfertas');
})

app.post('/email/*', function(req, res, err) {
/*
  if (err) {
    res.send('Esta conversación ha expirado')
    return
  }
*/
  var patharray = req.path.split('/');
  var id = patharray[patharray.length-1];
  var next;
  var response = req.body.response;
  var expornot = req.body.expOrNot

  var collection = db.collection('emails');

  collection.find({ 'id': id }).toArray(function(err, docs) {
    var emailData = docs[0]
    var subject = emailData['subject']
    if (expornot == "exp") {
      next = emailData['email']
      from = emailData['expEmail']
      expornot = "not"
    } else {
      next = emailData['expEmail']
      from = emaildata['email']
      expornot = "not"
    }

    app.mailer.send('email', {
      to: next,
      subject: subject + ', de: ' + from,
      id: id,
      content: response,
      expOrNot: expornot
    }, function (err) {
      if (err) {
        // handle error
        console.log(err);
        res.send('There was an error sending the email');
        return;
      }
      res.send('Enviado');
    });
  

  });
  
});

app.get('/CompartirTemas', function(req, res){
  res.render('CT', { isAdmin: (req.isAuthenticated), currentPage: "CT" });
});

app.get('/CompartirExperiencias', function(req, res){
  res.render('CE', { isAdmin: (req.isAuthenticated), currentPage: "CE" });
});

app.get('/admin', ensureAuthenticated, function(req, res){
  res.render('admin', { status: '' })
});

app.post('/admin', ensureAuthenticated, upload.single('pdf'), function(req, res){
  if (!req.file) {
    res.render('admin', { status: 'noPDF' });
    return;
  }
  var uploadInfo = req.body;
  var collection = db.collection('temas');
  var title = uploadInfo.title;
  var tempName = utils.toTitleCase(title)
  var tempName2 = tempName.replace(/\s/g, '');
  var pathName = utils.removeDiacritics(tempName2).replace(/\W/g, '');

  var comps = uploadInfo.comps.split(', ');
  var temas = uploadInfo.temas.split(', ');
  var toInsert = {'pathName': pathName, 'title': title, 'descript': uploadInfo.descript, 'cont': uploadInfo.Cont, 'comps': comps, 'temas': temas, 
  'email': uploadInfo.email, 'fileName': req.file.filename}

  collection.count({'pathName': pathName}, function(err, count) {
    if (count != 0) {
      res.render('admin', { status: 'title' });
      return;
    }
    collection.insert(toInsert, res.render('admin', { status: 'success' }));

  });

  var slickCollect = db.collection('slick');

  slickCollect.count({'cont': uploadInfo.Cont}, function(err, count) {
      slickCollect.update({'cont': uploadInfo.Cont}, toInsert);
  });
 
/* Add this to admin page (js with if, stopimmediatepropagation)
  if ((title == '') || (pathName == '') || (email == '') || (descript == '') || (comps == '') || (temas == '')) {
    res.render('admin', { status: 'field'});
    return;
  }
*/
  
});

app.get('/login', function(req, res){
  res.render('login');
});

// POST /admin
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res, next) {
    // Issue a remember me cookie if the option was checked
    if (!req.body.remember_me) { return next(); }
    
    issueToken(req.user, function(err, token) {
      if (err) { 
        console.log(err);
        return next(err); 
      }
      res.cookie('remember_me', token, { path: '/admin', httpOnly: true, maxAge: 604800000 });
      return next();
    });
  },
  function(req, res) {
    res.redirect('/admin');
  });

app.get('/logout', function(req, res){
  // clear the remember me cookie when logging out
  res.clearCookie('remember_me');
  req.logout();
  res.redirect('/login');
});

app.get('/*', function(req, res){
  res.render('error')
})




// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}