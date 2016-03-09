var express = require('express');
var https = require('https');
var fs = require('fs');
var cors = require('cors');
var bodyParser = require('body-parser');
var Datastore = require('nedb');
var interfaces = require('./networkInterfaces');

var credentials = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem')
};
var app = express();
var db = new Datastore({ filename: './droem.db', autoload: true });

var searchNewestEntry = function(doc, item) {
  var item_date = new Date(item.modifiedAt);
  var db_entry_date = new Date(doc.modifiedAt);

  if(isNaN(item_date.getTime())){
    item_date = null;
  }
  if(isNaN(db_entry_date.getTime())) {
    doc = null;
  }

  if(item_date > db_entry_date) {
    return item;
  } else {
    return doc;
  }
};

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '1000mb'}));

app.use(express.static(__dirname + '/static'));

app.get('/interfaces', function(req, res) {
  res.send(interfaces);
});

app.post("/sync", function(req, res) {
  var data = req.body;
  console.log(JSON.stringify(data))

  data.forEach(function(item) {
    db.findOne({ id: item.id }, function(err, doc) {
      if(!doc) {
        db.insert(item, function(err) {
          if(err) {
            console.log(err)
          }
        })
      } else {
        console.log("Entry with id " + item.id + " already there!");
        var newestEntry = searchNewestEntry(doc, item);

        db.update(doc, newestEntry, {}, function (err, numReplaced) {
        });
      }
    });
  });


  db.find({}, function(err, docs) {
    res.json(docs);
  });
});

app.get("/dreams", function(req, res) {
  db.find({}, function(err, docs) {
    res.json(docs);
  });
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(3000);
console.log("Server started on https://0.0.0.0:3000");
