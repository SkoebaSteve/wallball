var app = angular.module('WallBall', ['ngRoute', 'ngResource']);

app.config(function($routeProvider, $locationProvider){
  $routeProvider
    .when('/players', {
      controller: 'ListController',
      templateUrl: 'views/list.html'
    })
    .when('/players-new', {
      controller: 'NewController',
      templateUrl: 'views/new.html'
    })
    .when('/players/:id', {
      controller: 'SingleController',
      templateUrl: 'views/single.html'
    })
    .when('/matches', {
      controller: 'MatchController',
      templateUrl: 'views/matches.html'
    })
    .when('/matches/:id', {
      controller: 'SingleMatchController',
      templateUrl: 'views/single-match.html'
    })
    .when('/matches-new', {
      controller: 'NewMatchController',
      templateUrl: 'views/new-match.html'
    })
    .when('/play/:id', {
      controller: 'PlayController',
      templateUrl: 'views/play.html'
    })
    .otherwise({
      redirectTo: '/players'
    });

    // change urls from hashbangs
    $locationProvider.html5Mode(true);
});


// model setup
app.factory('Players', function($resource){
  return $resource('/api/players/:id', {id: '@_id'}, {
    'update': { method: 'PUT' }
  });
});

app.factory('Matches', function($resource){
  return $resource('/api/matches/:id', {id: '@_id'}, {
    'update': { method: 'PUT' },
    // 'addScore': {method: 'PUT' , params:{playerID:"1", point:"smash"}}
  });
});

app.factory('Points', function($resource){
  return $resource('/api/points/:id', {id: '@_id'}, {

  });
})
  
// controllers

app.controller('ListController', function($scope, Players){
  $scope.players = Players.query();
});

app.controller('NewController', function($scope, Players, $location){
  $scope.player = new Players();
  $scope.add = function(){
    $scope.player.$save();
    $location.url('/players');
  };

  // push messaging setup service

  var isPushEnabled = false;
  
  $scope.enablePush = function(){  
  
  }
});

app.controller('SingleController', function($scope, Players, $routeParams, $location){
  var id = $routeParams.id;
  $scope.player = Players.get({id: id});


  $scope.update = function(){
    console.log($scope.player);
    $scope.player.$update(function(){
      console.log("updated");
    });
  }

  $scope.delete = function(){
    $scope.player.$delete(function(){
      $location.url('/players');
    });
  }
});


app.controller('MatchController', function($scope, Matches){
  $scope.matches = Matches.query();
});

app.controller('SingleMatchController', function($scope, Players, Matches, Points, $routeParams, $location){
  var id = $routeParams.id;
  $scope.match = Matches.get({id: id});
  $scope.points = Points.query();

  console.log($scope.points);

  $scope.updateMatch = function(){
    $scope.match.$update();
  }
});

app.controller('NewMatchController', function($scope, Matches, Players, $location){
  $scope.players = Players.query();
  $scope.maxScore = 20;
  $scope.match = {
    maxScore: $scope.maxScore,
    players: []
  }

  $scope.addPlayer = function(player, $event){
    $event.target.disabled = true;

    var newPlayer = {
      id : player._id,
      name : player.firstName
    }
    $scope.match.players.push(newPlayer); 
    console.log($scope.match);
  }

   $scope.newMatch = function(){
    $scope.match.maxScore = $scope.maxScore;
    Matches.save($scope.match, function(result){
      $location.url('/play/'+result._id);
    });
   }
});

app.controller('PlayController', function($scope, Points, Matches, $routeParams, $location){
  var id = $routeParams.id;
  $scope.match = Matches.get({id: id});

  // angular.forEach($scope.match.players, function(value, key) {
  //   console.log("test");
  // });

  // please fix this
  $scope.scores = [0,0,0,0,0];

  $scope.updateScore = function(player, $index, $event){
    if($scope.scores[$index] < $scope.match.maxScore){
      $scope.score++;

      var point = {
        scoreType: "sudoku!",
        playerId: player.id,
        matchId: $scope.match._id
      };
      
      $scope.scores[$index]++;

      Points.save(point, function(result){
        console.log("point saved");
      })
    }
    else{
      $event.target.disabled = true;
    }
  }

  $scope.finishMatch = function(){
    $scope.match.$update(function(result){

    });
  }
});