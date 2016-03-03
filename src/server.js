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
  , emailDB = require('./emailDB')
  , pdfData = require('./pdfData');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/app/pdfs')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })

var users = [
    { id: 1, username: 'admin', password: 'Aprender'}
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
  from: 'noreplyaprenderconinteres@gmail.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'noreplyaprenderconinteres@gmail.com',
    pass: 'redesdetutoria'
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

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/RelacionTutoria', function(req, res){
  res.render('RT', { isAdmin: (req.isAuthenticated)});
});

app.get('/MapeoVirtual', function(req, res){
  console.log(req.user)
  res.render('MV', { isAdmin: (req.isAuthenticated)});
});

app.get('/CatalogoDeOfertas', function(req, res){
  res.render('CdO', { isAdmin: (req.isAuthenticated)});
});

app.get('/CatalogoDeOfertas/*', function(req, res){
  var patharray = req.path.split('/')
  var pathName = patharray[patharray.length-1];
  console.log(pathName)
  var pathData = pdfData[pathName]
  
  pathData['sent'] = false
  
  res.render('template', pathData);
});

app.post('/CatalogoDeOfertas/*', function(req, res){
  var id = utils.randomString(4);
  var expEmail = req.body.expEmail;
  var email = req.body.email;
  var question = req.body.question;
  var subject = req.body.subject + ', from: ' + email;
  var page = req.path.split('/')[2];

  var emailExchange = {};
  emailExchange[email] = expEmail;
  emailExchange[expEmail] = email;
  emailExchange['subject'] = subject;
  emailDB[id] = emailExchange;

  var toAppend = '"' + id + '": { "' + email + '": "' + expEmail + '", "' + expEmail + '": "' + email + '", "subject": "' + subject + '" },\n};\n\nmodule.exports = emailDB;';

  var stream = fs.openSync(__dirname + '/emailDB.js', 'r+')
  var stats = fs.statSync(__dirname + '/emailDB.js');
  var length = stats['size'];
 
  fs.writeSync(stream, toAppend, length - 29);
  fs.close(stream);

  app.mailer.send('email', {
    to: expEmail,
    subject: subject,
    id: id,
    content: question
  }, function (err) {
    if (err) {
      // handle error
      console.log(err);
      res.send('There was an error sending the email');
      return;
    }
    res.send('Email sent')
    return
  });

});

app.post('/email/*', function(req, res, err) {
  if (err) {
    res.send('Esta conversación ha expirado')
    return
  }
  var patharray = req.path.split('/')
  var id = patharray[patharray.length-1]
  var email = req.body.email;
  var subject = emailDB[id]['subject'];
  var response = req.body.response;
  var reply = emailDB[id][email]

  app.mailer.send('email', {
    to: reply,
    subject: subject,
    id: id,
    content: response
  }, function (err) {
    if (err) {
      // handle error
      console.log(err);
      res.send('There was an error sending the email');
      return;
    }
    res.send('Email Sent');
  });

});

app.get('/CompartirTemas', function(req, res){
  res.render('CT', { isAdmin: (req.isAuthenticated), currentPage: "CT" });
});

app.get('/CompartirExperiencias', function(req, res){
  res.render('CE', { isAdmin: (req.isAuthenticated), currentPage: "CE" });
});

app.get('/upload', function(req, res){
  res.render('upload', { status: '' })
});

app.post('/upload', upload.single('pdf'), function(req, res){
  if (!req.file) {
    res.render('upload', { status: 'noPDF' });
    return;
  }
  var uploadInfo = req.body;
  var filename = req.file.filename;
  var title = uploadInfo.title;
  var tempName = utils.toTitleCase(title)
  var tempName2 = tempName.replace(/\s/g, '');
  var pathName = utils.removeDiacritics(tempName2);
  var email = uploadInfo.email;

  if (pdfData[pathName]) {
    res.render('upload', { status: 'title' });
    return;
  }

  var descript = uploadInfo.descript;
  var comps = uploadInfo.comps.split(', ');
  var compsString = '["' + comps[0] + '"';
    for (i = 1; i < comps.length; i++) {
      compsString += ', "' + comps[i] + '"';
    }
  compsString += ']'
  var temas = uploadInfo.temas.split(', ');
  var temasString = '["' + temas[0] + '"';
    for (i = 1; i < temas.length; i++) {
      temasString += ', "' + temas[i] + '"';
    }
  temasString += ']'

  if ((title == '') || (pathName == '') || (email == '') || (descript == '') || (comps == '') || (temas == '')) {
    res.render('upload', { status: 'field'});
    return;
  }

  var Cont = uploadInfo.Cont;
  var newData = { filename: filename, title: title, descript: descript, comps: comps, temas: temas, pathName: pathName, email: email}
  pdfData[pathName] = newData

  var pdfPre = '"' + pathName + '": '
  var toAppend = '{ filename: "' + filename + '", title: "' + title + '", descript: "' + descript + '", comps: ' + compsString + ', temas: ' + temasString + ', pathName: "' + pathName + '", email: "' + email + '"},';
  var contAppend = '\n];\n$scope.gridlength=Math.ceil($scope.ofertas.length/3.)-2;\n$scope.blueheight=$scope.gridlength*224+197;\nif ($scope.gridlength<0) {$scope.blueheight=40};\n}]);';
  var pdfAppend = '\n};\nmodule.exports = pdfData;'

  var stream = fs.openSync(__dirname + '/public/app/Controllers/'+Cont+'Controller.js', 'r+')
  var stats = fs.statSync(__dirname + '/public/app/Controllers/'+Cont+'Controller.js');
  var length = stats['size'];
 
  fs.writeSync(stream, toAppend + contAppend, length - 158);
  fs.close(stream);

  var stream2 = fs.openSync(__dirname + '/pdfData.js', 'r+')
  var stats2 = fs.statSync(__dirname + '/pdfData.js');
  var length2 = stats2['size'];
 
  fs.writeSync(stream2, pdfPre + toAppend + pdfAppend, length2 - 28);
  fs.close(stream2);

  res.render('upload', { status: 'success' });
  
});

app.get('/admin', function(req, res){
  res.render('admin');
});

// POST /admin
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login

app.post('/admin', 
  passport.authenticate('local', { failureRedirect: '/admin', failureFlash: true }),
  function(req, res, next) {
    // Issue a remember me cookie if the option was checked
    if (!req.body.remember_me) { return next(); }
    
    issueToken(req.user, function(err, token) {
      if (err) { 
        console.log(err);
        return next(err); 
      }
      res.cookie('remember_me', token, { path: '/upload', httpOnly: true, maxAge: 604800000 });
      return next();
    });
  },
  function(req, res) {
    res.redirect('/upload');
  });

app.get('/logout', function(req, res){
  // clear the remember me cookie when logging out
  res.clearCookie('remember_me');
  req.logout();
  res.redirect('/');
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port', app.get('port'));
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/admin')
}