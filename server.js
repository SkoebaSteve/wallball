// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var jQuery         = require('jquery');

var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/wallball');

var playerSchema = new mongoose.Schema({
  firstName: { type: String }
, lastName: { type: String }
});

var Players = mongoose.model('Player', playerSchema);

// var steef = new Player({
//   firstName : 'Steef',
//   lastName : 'Janssen'
// });

// steef.save(function(err){
//   if (err) return console.error(err);
// });


// configuration ===========================================

app.use(bodyParser.json());
app.use(express.static('./public'));

app.route('/api/players')
  .get(function(req, res) {
    Players.find({}, function(err, players){
      res.json(players);
    });
  })
  .post(function(req, res){
    var record = req.body;

    var player = new Player({
      firstName : record.firstName,
      lastName : record.lastName
    });

    player.save(function(err){
      if (err) return console.error(err);
    });

    res.json(record);
  });

app.route('/api/players/:id')
  .get(function(req,res){
    res.json(data[req.params.id]);
  })
  .put(function(req,res){
    data[req.params.id] = req.body;
    res.json(req.body);
  })
  .delete(function(req, res){
    delete data[req.params.id];
    res.json(null);
  });

app.get('*', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000);
