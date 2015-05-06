var Engine = require('tingodb')();
var db = new Engine.Db('data/', {});

var Users = db.collection("users");
var Candidate = db.collection("candidate");

var totalVotes = 0;
var electionApp = angular.module('electionApp', ['ngRoute']);
function updateData($rootScope) {
    totalVotes = 0;
    Candidate.find({}, {sort: {"vote": -1}}).toArray(function (erroe, data) {
        $rootScope.candidateList = data;
        for (single in data) {
            if (data[single].vote != null)
                totalVotes += data[single].vote;
            else
                data[single].vote = 0;
        }
        $rootScope.totalVotes = totalVotes;
        $rootScope.$apply();


    });
}

electionApp.run(function ($rootScope, $location) {
    updateData($rootScope);
    $rootScope.removeCandidate = function (item) {
        db.candidate.remove({_id: item}, {}, function (err, numRemoved) {
            updateData($rootScope);

        });
    }
    $rootScope.logout = function () {
        sessionStorage.removeItem("userId");
        $location.path("/login");

        if (!$rootScope.$$phase) $rootScope.$apply()

    }


})

electionApp.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/login', {
                templateUrl: 'partial/login.html',
                controller: 'LoginCtrl',
                'class': 'login-page',
                title: 'login'
            }).
            when('/dashboard', {
                templateUrl: 'partial/dashboard.html',
                controller: 'DashBoardCtrl',
                'class': 'skin-blue',
                title: 'dashboard'
            }).
            when('/candidate', {
                templateUrl: 'partial/candidates.html',
                controller: 'CandidateCtrl'
            }).
            when('/vote', {
                templateUrl: 'partial/vote.html',
                controller: 'VoteCtrl'
            }).
            when('/register', {
                templateUrl: 'partial/register.html',
                controller: 'RegCtrl',
                'class': 'login-page'

            }).
            otherwise({
                redirectTo: '/register'
            });

        $locationProvider.hashPrefix('!');

    }]).directive('classRoute', function ($rootScope, $route) {

    return function (scope, elem, attr) {
        var previous = '';
        $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
            var route = currentRoute.$$route;
            if (route) {

                var cls = route['class'];

                if (previous) {
                    attr.$removeClass(previous);
                }

                if (cls) {
                    previous = cls;
                    attr.$addClass(cls);
                }
            }
        });
    };

});


electionApp
    .controller('RegCtrl', function ($scope, $location) {
        $scope.register = function () {
            Users.insert({username: $scope.username, password: $scope.password}, function (error, data) {
                console.log(data[0]);
            });
        };
        Users.count(function (error, count) {
            console.log(count + "hh");
            if (count == 0) {

            } else {
                $location.path("/login");
                if (!$scope.$$phase) $scope.$apply()

            }

        });

    })
    .controller('LoginCtrl', function LoginCtrl($scope, $location) {
        if (sessionStorage.userId != null) {
            $location.path("/dashboard");
        }
        $scope.login = function () {
            Users.findOne({
                username: $scope.username,
                password: $scope.password
            }, function (error, data) {
                console.log("Yea");
                if (data != null) {
                    sessionStorage.userId = data.username;
                    $location.path("/dashboard");
                    if (!$scope.$$phase) $scope.$apply()
                } else {
                    alert("Invalid Username or password");
                }
            });


        }


    })
    .controller('VoteCtrl', function ($scope, $rootScope) {
        $scope.select = function (id) {
            console.log(id);
            $scope.current = id;

        }
        $scope.voteNow = function () {
            if ($scope.current == null) {
                alert("Please Select One");
                return;
            }
            Candidate.update({_id: $scope.current}, {$inc: {vote: 1}}, {upsert: true}, function (error, data) {
                alert("Your Vote Has been Submitted");
                $scope.current = null;
                $scope.$apply();
                updateData($rootScope);
            })
        }

    }).controller('DashBoardCtrl', function ($scope, $rootScope, $location) {
        if (sessionStorage.userId == null) {
            $location.path("/login");
        }
        $rootScope.username = sessionStorage.userId;


    }).controller('CandidateCtrl', function ($scope, $rootScope) {

        $scope.saveCandidate = function () {
            console.log("Hello");
            icon = $("#icon").val();
            Candidate.insert({name: $scope.candidate.name, icon: icon});
            updateData($rootScope);

        };

    })


