// server.js

// modules =================================================
var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var gcm             = require('node-gcm');
var mongoose        = require('mongoose');


// database connection =================================================
var db = mongoose.connection;
var password = process.env.PWD;
var username = process.env.USER;

mongoose.connect('mongodb://'+ username +':' + password + '@ds043714.mongolab.com:43714/heroku_frwx3kzq');
var Schema = mongoose.Schema;

var playerSchema = Schema({
  firstName: { type: String },
  lastName: { type: String }
});

var matchSchema = Schema({  
  time : { type : Date, default: Date.now },
  players : [{
    id:{ type : String },
    name:{ type : String },
    rank:{ type: Number, default: 0 },
    points:[{
      time : { type : Date, default: Date.now },
      scoreType: {type: String},
    }]
  }],
  maxScore: { type: Number, default: 20}
});

var pointSchema = Schema({
  time : { type : Date, default: Date.now },
  scoreType: {type: String},
  playerId : { type: String },
  matchId : { type: String}
});

var Players = mongoose.model('Player', playerSchema);
var Matches = mongoose.model('Match', matchSchema);
var Points = mongoose.model('Point', pointSchema);

// message service =================================================

var message = new gcm.Message();

// configuration ===========================================

app.use(bodyParser.json());
app.use(express.static('./public'));

// player api setup

app.route('/api/players')
  .get(function(req, res) {
    Players.find({}, function(err, players){
      res.json(players);
    });
  })
  .post(function(req, res){
    var record = req.body;

    var player = new Players({
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
    Players.findOne({'_id': req.params.id}, function(err, player){
      res.json(player);
    });
  })
  .delete(function(req, res){
    Players.findOne({'_id': req.params.id}).remove().exec(function(){
      res.json(null);
    });
  })
  .put(function(req,res){
    Players.update({'_id': req.params.id}, req.body, {upsert: true}, function(result){
      res.json(result);
    });
  });


// matches api setup

app.route('/api/matches')
  .get(function(req, res) {
    Matches.find({}, function(err, matches){
      res.json(matches);
    });
  })
  .post(function(req, res){
    var record = req.body;

    var match = new Matches({
      maxScore: record.maxScore,
      players: record.players
    });

    match.save(function(err){
      if (err) return console.error(err);
    });

    res.json(match);
  });

app.route('/api/matches/:id')
  .get(function(req,res){

    // in a single match it should get the match with id but also the points per player

    Matches.findOne({'_id': req.params.id}, function(err, match){

      match.players.forEach(function(item, i) {
        Points.find({'matchId' : match._id, 'playerId' : item.id}, function(err, points){
          points.forEach(function(p, i){
            item.points.push({
              "time": p.time,
              "scoreType": p.scoreType
            });
          });
        }).then(function(data) {
          res.json(match);
        });
      });

    });

  })
  .put(function(req, res){
    Matches.update({'_id': req.params.id}, req.body, {upsert: false}, function(result){
      res.json(result);
    });
  });

// point api setup

app.route('/api/points')
  .get(function(req, res) {
    Points.find({}, function(err, points){
      res.json(points);
    });
  })
  .post(function(req, res){
    var record = req.body;

    var point = new Points({
      scoreType: record.scoreType,
      playerId : record.playerId,
      matchId : record.matchId
    });

    point.save(function(err, point){
      if (err) return console.error(err);
      res.json(point);
    });

  });

// all other request point to index

app.get('*', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000);
