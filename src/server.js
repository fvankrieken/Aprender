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
  , unoconv = require('unoconv2')
  , MongoClient = require('mongodb').MongoClient
  , MongoURL = 'mongodb://finn:sociedad@ec2-52-32-107-9.us-west-2.compute.amazonaws.com:27017/data'
  , password = require('./password').password
  , https = require('https')

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

// Storage for uploaded pdfs
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/pdfs')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/pdfTemp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var otherStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/ejemplos')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })
var tempUpload = multer({ storage: tempStorage })
var otherUpload = multer({ storage: otherStorage})

// Users for login (for administrator privileges)
var users = [
    { id: 1, 'username': 'admin', 'password': password}
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

// declare app
var app = express();

// initialize mailer for "Ask an expert"
mailer.extend(app, {
  from: 'consultasaprenderconinteres@gmail.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'consultasaprenderconinteres@gmail.com',
    pass: password
  }
});

// initialize app settings
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', 80)
app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.use(CookieParser());
app.use(BodyParser.urlencoded({ extended: true, limit: '5mb'}));
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

downJSON = {'/': false, '/RelacionTutora': false, '/MapeoVirtual': false, '/CatalogoDeOfertas': false, '/CompartirTemas': false, '/CompartirExperiencias': false, '/Noticias': false }

// blueHeight: helper for CdO formatting
app.locals.blueHeight = function(subject) {
  var gridLength = Math.ceil(subject.length/3.)-2;
  var toReturn = (gridLength * 239) + 155;
  if (gridLength < 0) {return 40};
  return toReturn;
}

app.locals.downloadName = '';

app.locals.makeLink = utils.makeLink

// for index when db is empty
app.locals.slickBlank = {'title': '', 'pathName': '', 'comps': [], 'temas': [], 'descript': ''}

/*
 * Index
 */

app.get('/', function(req, res, next) { downForMaintenance('/', req, res, next) }, function(req, res){
  var collection = db.collection('slick');
  var slickArray = []
  var toAdd

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
            noticiadb = db.collection('noticias')
            noticiadb.find().toArray(function(err, docs) {
              noticia = docs[0]
              noticia['slicks'] = slickArray;
              noticia['isAdmin'] = req.isAuthenticated();
              noticia['down'] = downJSON['/'];
              res.render('index', noticia);
            });
          });
        });
      });
    });
  });
});

app.post('/', ensureAuthenticated, function(req, res){
  var noticiadb = db.collection('noticias')
  var form = req.body
  toInsert = {'title': form.title, 'text': form.text, 'fontSize': form.fontSize, 'link': form.link, 'img': form.img }
  noticiadb.findOneAndUpdate({}, toInsert, function(err, count) {
    res.redirect('/')
  })
})

/*
 * Relacion Tutora
 */

app.get('/RelacionTutora', function(req, res, next) { downForMaintenance('/RelacionTutora', req, res, next) }, function(req, res){
  res.render('RT', { 'isAdmin': (req.isAuthenticated()), 'down': downJSON['/RelacionTutora']});
});

/*
 * Mapeo Virtual
 */

app.get('/MapeoVirtual', function(req, res, next) { downForMaintenance('/MapeoVirtual', req, res, next) }, function(req, res){
  res.render('MV', { 'isAdmin': (req.isAuthenticated()), 'down': downJSON['/MapeoVirtual']});
});

/*
 * Catálogo de Ofertas
 */

// GET CdO
app.get('/CatalogoDeOfertas', function(req, res, next) { downForMaintenance('/CatalogoDeOfertas', req, res, next) }, function(req, res){
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

            catJSON['isAdmin'] = req.isAuthenticated();
            catJSON['down'] = downJSON['/CatalogoDeOfertas']

            res.render('CdO', catJSON);
            
          });
        });
      });
    });
  });
});

// GET CdO/tema: show individual tema
app.get('/CatalogoDeOfertas/*', function(req, res, next) { downForMaintenance('/CatalogoDeOfertas', req, res, next) }, function(req, res){
  var patharray = req.path.split('/')
  var pathName = patharray[patharray.length-1];
  collection = db.collection('temas')

  collection.find({ 'pathName': pathName }).toArray(function(err, pathDataArray) {
    pathData = pathDataArray[0]
    if (!pathData) {
      res.render('error', {'isAdmin': req.isAuthenticated});
      return;
    }
    pathData['isAdmin'] = req.isAuthenticated();
    pathData['down'] = downJSON['/CatalogoDeOfertas']
    res.render('template', pathData);
  });
 
});

// POST CdO/tema: send email to expert
app.post('/CatalogoDeOfertas/*', function(req, res, next) { downForMaintenance('/CatalogoDeOfertas', req, res, next) }, function(req, res){
  var patharray = req.path.split('/')
  var pathName = patharray[patharray.length-1]; 
  var id = utils.randomString(4);
  var email = req.body.email;
  var question = req.body.question;
  var name = req.body.name;
  var subject = req.body.subject;
  var page = req.path.split('/')[2];
  var content = name + ':\n\n' + question

  var findEmail = db.collection('temas');

  findEmail.find({ 'pathName': pathName }).toArray(function(err, pathDataArray) {
    pathData = pathDataArray[0];
    var expEmail = pathData['email'];
    var collection = db.collection('emails');

    var toInsert = { 'id': id, 'email': email, 'expEmail': expEmail, 'subject': subject};

    collection.insert(
      toInsert, 
      app.mailer.send('email', 
        {
          to: expEmail,
          subject: subject + ', de: ' + email,
          id: id,
          content: content,
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
});

// GET edit/tema: editable tema page. must ensure authenticated
app.get('/edit/*', ensureAuthenticated, function(req, res){
  var patharray = req.path.split('/');
  var pathName = patharray[patharray.length-1];
  collection = db.collection('temas');

  collection.find({ 'pathName': pathName }).toArray(function(err, pathDataArray) {
    pathData = pathDataArray[0]
    if (!pathData) {
      res.render('error');
      return;
    }
    pathData['isAdmin'] = req.isAuthenticated();
    pathData['down'] = downJSON['/CatalogoDeOfertas']
    res.render('editTemplate', pathData);
  });
});

// POST edit/tema: make changes to existing tema
app.post('/edit/*', ensureAuthenticated, function(req, res){
  var uploadInfo = req.body;
  var collection = db.collection('temas');
  var OGpathName = uploadInfo.OGpathName;
  var title = uploadInfo.title;
  var tempName = utils.toTitleCase(title);
  var tempName2 = tempName.replace(/\s/g, '');
  var pathName = utils.removeDiacritics(tempName2).replace(/\W/g, '');

  var comps = uploadInfo.comps.split(', ');
  var temas = uploadInfo.temas.split(', ');
  var badge;
  if (uploadInfo.badge == "True") { badge = true } else { badge = false }

  var toInsert = {'pathName': pathName, 'title': title, 'descript': uploadInfo.descript, 'cont': uploadInfo.Cont, 'comps': comps, 'temas': temas, 
  'email': uploadInfo.email, 'fileName': req.body.fileName, 'badge': badge}

  collection.findOneAndUpdate({'pathName': OGpathName}, toInsert, function(err, count) {
    var slickCollect = db.collection('slick');

    slickCollect.findOneAndUpdate({'pathName': OGpathName}, toInsert, function(err, count) {
      res.redirect('/CatalogoDeOfertas/'+pathName);
    });
  });
});

// GET delete/tema: remove tema from DB
app.get('/delete/*', ensureAuthenticated, function(req, res) {
  var patharray = req.path.split('/');
  var pathName = patharray[patharray.length-1];
  collection = db.collection('temas');
  collection.deleteOne({'pathName': pathName});
  slickCollect = db.collection('slick');
  slickCollect.deleteOne({'pathName': pathName})
  res.redirect('/CatalogoDeOfertas');
});

// GET nuevo/tema: add tema to slick
app.get('/nuevo/*', ensureAuthenticated, function(req, res) {
  var patharray = req.path.split('/');
  var pathName = patharray[patharray.length-1]
  collection = db.collection('temas');
  collection.find({'pathName': pathName}).toArray(function(err, docs) {
    var toAdd = docs[0];
    var slickCollect = db.collection('slick');
    var currCont = toAdd['cont'];
    slickCollect.count({'cont': currCont}, function(err, count) {
      if (count == 0) {
        slickCollect.insert(toAdd, res.redirect('/edit/' + pathName))
      } else {
        delete toAdd._id
        slickCollect.findOneAndUpdate({'cont': currCont}, toAdd, function(err, count) {
          if (err) {
            res.send(err)
          } else {
            res.redirect('/');
          }
        });
      }
    });
  });
});

/*
 * EMAIL
 * posted to from emails sent by app.mailer
 */

// POST email
app.post('/email/*', function(req, res) {

  var patharray = req.path.split('/');
  var id = patharray[patharray.length-1];
  var next;
  var response = req.body.response;
  var expornot = req.body.expOrNot

  var collection = db.collection('emails');

  collection.find({ 'id': id }).toArray(function(err, docs) {
    if (err) {
      console.log(err)
      res.send('Esta conversación ha expirado')
      return
    }
    var emailData = docs[0];
    var subject = emailData['subject'];
    var addSubject = '';
    if (expornot == "exp") {
      next = emailData['email']
      from = emailData['expEmail']
      expornot = "not"
    } else {
      next = emailData['expEmail']
      from = emailData['email']
      addSubject = ', de: ' + from
      expornot = "exp"
    }

    app.mailer.send('email', {
      to: next,
      subject: subject + addSubject,
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

/*
 * Compartir Experiencias
 */

// GET CT
app.get('/CompartirTemas', function(req, res, next) { downForMaintenance('/CompartirTemas', req, res, next) }, function(req, res){
  res.render('CT', { 'isAdmin': (req.isAuthenticated()), 'status': '', 'down': downJSON['/CompartirTemas']});
});

app.post('/CompartirTemas', tempUpload.fields([{'name': 'tema'}, {'name': 'tutor'}, {'name': 'aprendiz'}, {'name': 'apoyo'}]), function(req, res){
  var files = req.files;
  console.log(files)
  var collection = db.collection('tempPDFs');
  temaNombre = req.body.temaNombre;
  var temaPath = utils.makeLink(temaNombre);
  var tema, tutor, aprendiz, apoyo
  if (req.files['tema']) {
    tema = req.files['tema'][0]['filename']
  }
  if (req.files['tutor']) {
    tutor = req.files['tutor'][0]['filename']
  }
  if (req.files['aprendiz']) {
    aprendiz = req.files['aprendiz'][0]['filename']
  }
  if (req.files['apoyo']) {
    apoyo = req.files['apoyo'][0]['filename']
  }
  var toInsert = {'temaNombre': temaNombre, 'temaPath': temaPath, 'tema': tema, 'tutor': tutor, 'aprendiz': aprendiz, 'apoyo': apoyo}
  collection.count({'temaPath': temaPath}, function(err, count) {
    if (count != 0) {
      res.render('CT', { 'isAdmin': (req.isAuthenticated()), 'status': 'title', 'down': downJSON['/CompartirTemas']});
      return;
    }
    collection.insert(toInsert, function(err, count) {
      res.render('CT', { 'isAdmin': (req.isAuthenticated()), 'status': '', 'down': downJSON['/CompartirTemas']})
    });
  });
});

/*
 * Compartir Experiencias
 */

// GET CE
app.get('/CompartirExperiencias', function(req, res, next) { downForMaintenance('/CompartirExperiencias', req, res, next) }, function(req, res){
  var collection = db.collection('forum');
  var checked = req.session.checked || '';
  req.session.checked = '';
  var inUse = req.session.inUse || false;
  req.session.inUse = false;
  collection.find().toArray(function(err, topicArray) {
    res.render('CE', { 'isAdmin': (req.isAuthenticated()), 'topics': topicArray, 'inUse': inUse, 'checked': checked, 'down': downJSON['/CompartirExperiencias']});
  });
});

// POST CE: adding a new topic
app.post('/CompartirExperiencias', function(req, res, next) { downForMaintenance('/CompartirExperiencias', req, res, next) }, function(req, res) {
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    res.render('/CompartirExperiencias', {'captcha': false})
  }
  // Put your secret key here.
  var secretKey = "6LeICCITAAAAAO3-Wg7wU2aQKhaxmJGx0HTZir0N";
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(error,response,body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      var collection = db.collection('forum')
      var topic = req.body.topic
      var tempName = utils.toTitleCase(topic)
      var tempName2 = tempName.replace(/\s/g, '');
      var pathName = utils.removeDiacritics(tempName2).replace(/\W/g, '');
      var id = utils.randomString(4);
      collection.count({'pathName': pathName}, function(err, count) {
        if (count != 0) {
          req.session.inUse = true;
          res.redirect('/CompartirExperiencias');
          return;
        }
        var toInsert = {'pathName': pathName,'topic': topic, 'comments': [{'name': req.body.name, 'comment': req.body.comment, 'date': req.body.date, 'commentID': id}]}
        collection.insert(toInsert, function(err, count) {
          res.redirect('/CompartirExperiencias');
        });
      });
    }
    res.render('/CompartirExperiencias', {'captcha': false})
  });
});

// POST CE/topic: add a comment to a topic
app.post('/CompartirExperiencias/*', function(req, res, next) { downForMaintenance('/CompartirExperiencias', req, res, next) }, function(req, res) {
  var patharray = req.path.split('/');
  var pathName = patharray[patharray.length-1];
  var collection = db.collection('forum');
  var id = utils.randomString(4);
  collection.find({'pathName': pathName}).toArray(function(err, array) {
    var topic = array[0];
    var comments = topic['comments'];
    var toAdd = {'name': req.body.name, 'comment': req.body.comment, 'date': req.body.date, 'commentID': id};
    comments.unshift(toAdd);
    var toInsert = {'pathName': pathName,'topic': topic['topic'], 'comments': comments}
    collection.findOneAndUpdate({'pathName': pathName}, toInsert, function(err, count) {
      req.session.checked = pathName;
      res.redirect('/CompartirExperiencias');
    });
  });
});

// GET CE/topic: remove a topic
app.get('/CompartirExperiencias/*', ensureAuthenticated, function(req, res) {
  var patharray = req.path.split('/');
  var pathName = patharray[patharray.length-1];
  collection = db.collection('forum');
  collection.deleteOne({'pathName': pathName})
  res.redirect('/CompartirExperiencias');
})

// GET rm/topic/commentID: remove a comment
app.get('/rm/*/*', ensureAuthenticated, function(req, res) {
  var patharray = req.path.split('/');
  var commentID = patharray[patharray.length-1];
  var pathName = patharray[patharray.length-2];
  collection = db.collection('forum');
  collection.find({'pathName': pathName}).toArray(function(err, array) {
    var topic = array[0];
    var comments = topic['comments']
    for (var i = 0; i < comments.length; i++) {
      if (comments[i]['commentID'] == commentID) {
        comments.splice(i, 1)
      }
    }
    var toInsert = {'pathName': pathName, 'topic': topic['topic'], 'comments': comments}
    collection.findOneAndUpdate({'pathName': pathName}, toInsert, function(err, count) {
      req.session.checked = topic['pathName'];
      res.redirect('/CompartirExperiencias')
    })
  })
})

/*
 * NOTICIAS
 */

// GET noticias
app.get('/Noticias', function(req, res, next) { downForMaintenance('/Noticias', req, res, next) }, function(req, res){
  var collection = db.collection('forum');
  var inUse = req.session.inUseN || false;
  req.session.inUseN = false;
  collection.find().toArray(function(err, topicArray) {
    res.render('N', { 'isAdmin': (req.isAuthenticated()), '': noticiaArray, 'inUse': inUse, 'down': downJSON['/Noticias']});
  });
});

// POST noticias: adding a new topic
app.post('/Noticias', function(req, res, next) { downForMaintenance('/Noticias', req, res, next) }, function(req, res) {
  var collection = db.collection('noticias')
  var title = req.body.title
  var tempName = utils.toTitleCase(title)
  var tempName2 = tempName.replace(/\s/g, '');
  var pathName = utils.removeDiacritics(tempName2).replace(/\W/g, '');
  collection.count({'pathName': pathName}, function(err, count) {
    if (count != 0) {
      req.session.inUseN = true;
      res.redirect('/Noticias');
      return;
    }
    var toInsert = {'pathName': pathName,'title': title, 'text': req.body.text, 'name': req.body.name, 'date': req.body.date}
    collection.insert(toInsert, function(err, count) {
      res.redirect('/Noticias');
    });
  });
});

// GET noticias/topic: remove topic
app.get('/Noticias/*', ensureAuthenticated, function(req, res) {
  var patharray = req.path.split('/');
  var pathName = patharray[patharray.length-1];
  collection = db.collection('noticias');
  collection.deleteOne({'pathName': pathName})
  res.redirect('/Noticias');
})

/*
 * ADMIN
 */

// GET admin
app.get('/admin', ensureAuthenticated, function(req, res){
  res.render('admin', { status: '' })
});

var listener = unoconv.listen( {port: 2002} )
// POST admin: upload a new tema
app.post('/admin', ensureAuthenticated, upload.single('pdf'), function(req, res){
  if (!req.file) {
    res.render('admin', { status: 'noPDF' });
    return;
  }
  var fileName = req.file.filename;
  var nameArray = fileName.split('.');
  var extension = nameArray[nameArray.length - 1];
  var downloadName = ''
  
  if (extension != 'pdf') {
    var newPathName = '';
    for (var i = 0; i <= nameArray.length - 2; i++) {
      newPathName += nameArray[i]
    }
    newPathName += '.pdf';
    fileName = newPathName;
    downloadName = req.file.fileName
    
    unoconv.convert(req.file.path, 'pdf', {'bin': 'unoconv'}, function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      
      fs.writeFile(req.file.destination + '/' + newPathName, result);
    });
  }
  
  var uploadInfo = req.body;
  var collection = db.collection('temas');
  var title = uploadInfo.title;
  var tempName = utils.toTitleCase(title)
  var tempName2 = tempName.replace(/\s/g, '');
  var pathName = utils.removeDiacritics(tempName2).replace(/\W/g, '');

  var comps = uploadInfo.comps.split(', ');
  var temas = uploadInfo.temas.split(', ');
  var badge;
  if (uploadInfo.badge == "True") { badge = true } else { badge = false }

  var toInsert = {'pathName': pathName, 'title': title, 'descript': uploadInfo.descript, 'cont': uploadInfo.Cont, 'comps': comps, 'temas': temas, 
  'email': uploadInfo.email, 'fileName': fileName, 'downloadName': downloadName, 'badge': badge, 'desde': uploadInfo.desde }

  collection.count({'pathName': pathName}, function(err, count) {
    if (count != 0) {
      res.render('admin', { status: 'title' });
      return;
    }
    collection.insert(toInsert, function(err, count) {
      var slickCollect = db.collection('slick');

      slickCollect.count({'cont': uploadInfo.Cont}, function(err, count) {
        if (count == 0) {
          slickCollect.insert(toInsert, res.render('admin', { status: 'success' }))
        } else {
          delete toInsert._id
          slickCollect.findOneAndUpdate({'cont': uploadInfo.Cont}, toInsert, function(err, count) {
            if (err) {
              res.send(err)
            } else {
              res.render('admin', { status: 'success' });
            }
          });
        }
      });
    });
  });
 
/* Add this to admin page (js with if, stopimmediatepropagation)
  if ((title == '') || (pathName == '') || (email == '') || (descript == '') || (comps == '') || (temas == '')) {
    res.render('admin', { status: 'field'});
    return;
  }
*/
  
});

/*
 * pdfs
 * pdfs uploaded from CT
 */

// GET archivos
app.get('/archivos', ensureAuthenticated, function(req, res) {
  var temas = db.collection('tempPDFs')
  temas.find({}).toArray(function(err, docs) {
    console.log(docs)
    res.render('archivos', {'temaNombres': docs})
  })
})

// GET archivos/pdf
app.get('/archivos/*', ensureAuthenticated, function(req, res) {
  var patharray = req.path.split('/');
  var pathName = patharray[patharray.length-1];
  var temas = db.collection('tempPDFs')
  temas.find({'temaPath': pathName}).toArray(function(err, docs) {
    var tema = docs[0]
    if (!tema) {
      res.render('error', {isAdmin: req.isAuthenticated});
      return
    }
    res.render('pdfTemplate', tema)
  })
})

//marking pages down for maintenance

app.post('/down', ensureAuthenticated, function(req, res) {
  var page = req.body.page;
  var currentState = downJSON[page];
  downJSON[page] = !currentState;
  console
  res.redirect(page);
})

/*
 * LOGIN
 * login page for admin privileges
 */

// GET login
app.get('/login', function(req, res){
  res.render('login', { isAdmin: (req.isAuthenticated())});
});

// POST login: authenticates user, redirects if not valid
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

/*
 * LOGOUT
 */

// GET logout: logs administrator out
app.get('/logout', function(req, res){
  // clear the remember me cookie when logging out
  res.clearCookie('remember_me');
  req.logout();
  res.redirect('/');
});

app.get('/uploadSupport', ensureAuthenticated, function(req, res){
  res.render('uS', { isAdmin: (req.isAuthenticated()), status: ''})
})

app.post('/uploadSupport', ensureAuthenticated, otherUpload.single('upload'), function(req, res){
  res.render('uS', { isAdmin: (req.isAuthenticated()), status: 'success'})
})


/*
 * Catch all (bad url)
 */
app.get('/*', function(req, res){
  res.render('error', { isAdmin: (req.isAuthenticated())})
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

function downForMaintenance(page, req, res, next) {
  if (downJSON[page]) {
    if (req.isAuthenticated()) { return next(); } else { res.render('down', {isAdmin: false, currPage: page})}
  } else {
    return next();
  }
}