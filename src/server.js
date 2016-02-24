var express = require('express')
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
  , templates = require('./pdfTemplate');

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


app.set('views', __dirname + '/public/views');
app.set('view engine', 'html');
app.set('port', (process.env.PORT || 3000))
app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.use(CookieParser());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(MethodOverride());
app.use(session({
  secret: 'keyboard cat'
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
  res.render('RT', { isAdmin: (req.isAuthenticated), currentPage: "RT" });
});

app.get('/MapeoVirtual', function(req, res){
  console.log(req.user)
  res.render('MV', { isAdmin: (req.isAuthenticated), currentPage: "MV" });
});

app.get('/CatalogoDeOfertas', function(req, res){
  res.render('CdO', { isAdmin: (req.isAuthenticated), currentPage: "CdO" });
});

app.get('/CatalogoDeOfertas/*.pdf', function(req, res){
  var pdfName = req.path.split('/')[2]
  var routeName = pdfName.split('.')[0]
  res.render('pdfViews/'+routeName+'.html', { isAdmin: (req.isAuthenticated), currentPage: "CdO" });
});

app.get('/CompartirTemas', function(req, res){
  res.render('CT', { isAdmin: (req.isAuthenticated), currentPage: "CT" });
});

app.get('/CompartirExperiencias', function(req, res){
  res.render('CE', { isAdmin: (req.isAuthenticated), currentPage: "CE" });
});

app.get('/upload', ensureAuthenticated, function(req, res){
  res.render('upload')
});

app.post('/upload', ensureAuthenticated, upload.single('pdf'), function(req, res){
  var uploadInfo = req.body;
  //TODO: DIFFERENT CONTROLLERS
  var Cont = uploadInfo.Cont;
  var stream = fs.openSync(__dirname + '/public/app/Controllers/'+Cont+'Controller.js', 'r+')
  var stats = fs.statSync(__dirname + '/public/app/Controllers/'+Cont+'Controller.js');
  var length = stats['size'];
  //TODO: Make strings with ""
  var toAppend = '{ title: "'+ uploadInfo.title + '", descript: "' + uploadInfo.descript + '", filename: "' + req.file.filename  + '"},\n];\n$scope.gridlength=Math.ceil($scope.ofertas.length/3.)-2;\n$scope.blueheight=$scope.gridlength*224+197;\nif ($scope.gridlength<0) {$scope.blueheight=40};\n}]);';
  fs.writeSync(stream, toAppend, length - 158);
  fs.close(stream);
  var newFileName = req.file.filename.split('.')[0] + '.html'
  //TODO: template plus is writeFILE async?
  var toWrite = templates.template1 + '<object data="/app/pdfs/' + req.file.filename + '" type="application/pdf" width="90%" height="100%"><p>Alternative text - include a link <a href="/app/pdfs/' +req.file.filename + '">to the PDF!</a></p></object>' + templates.template2
  fs.writeFile(__dirname + '/public/views/pdfViews/' + newFileName, toWrite, res.render('upload'));
  
});

app.get('/admin', function(req, res){
  res.render('admin', { user: req.user, pages: [false, false, false, false, false], message: req.flash('error') });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login

app.post('/admin', 
  passport.authenticate('local', { failureRedirect: '/admin', failureFlash: true }),
  function(req, res, next) {
    console.log(req.body);
    // Issue a remember me cookie if the option was checked
    if (!req.body.remember_me) { return next(); }
    
    issueToken(req.user, function(err, token) {
      if (err) { 
        console.log(err);
        return next(err); 
      }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
      return next();
    });
  },
  function(req, res) {
    res.redirect('/');
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