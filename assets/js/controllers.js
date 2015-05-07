var gui = require('nw.gui');
var Engine = require('tingodb')();
var db = new Engine.Db(gui.App.dataPath + '', {});
console.log(gui.App.dataPath + '/data/');
var Users = db.collection("users");
var Candidate = db.collection("candidate");

var totalVotes = 0;
var electionApp = angular.module('electionApp', ['ngRoute', 'pascalprecht.translate']);
function updateData($rootScope) {
    totalVotes = 0;
    Candidate.find({}).toArray(function (erroe, data) {
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

electionApp.run(function ($rootScope, $location, $translate) {
    $rootScope.languages = [{
        id: "enUS", title: "English"
    }, {
        id: "ml_IN", title: "Malayalam"
    }];

    $rootScope.schoolName = localStorage.schoolName;

    $rootScope.language = "enUS";
    updateData($rootScope);
    $rootScope.removeCandidate = function (item) {
        Candidate.remove({_id: item}, {}, function (err, numRemoved) {
            updateData($rootScope);

        });
    }
    $rootScope.logout = function () {
        sessionStorage.removeItem("userId");
        $location.path("/login");
        if (!$rootScope.$$phase) $rootScope.$apply()

    };
    $rootScope.changeLang = function () {
        console.log($rootScope.language);
        $translate.use($rootScope.language);

    };
    $rootScope.voteWindow = function () {
        $location.path("/vote");
        if (!$rootScope.$$phase) $rootScope.$apply()
    }
    $rootScope.goToDashboard = function () {
        swal({
            title: "Admin Password",
            text: "Please enter Admin password",
            type: "input",
            closeOnConfirm: false,
            showCancelButton: true,
            animation: "slide-from-top",
            inputPlaceholder: "Enter Password", inputType: "password"
        }, function (inputValue) {
            if (inputValue === false) return false;
            if (inputValue === "") {
                swal.showInputError("You need to Enter Password!");
                return false
            }
            if (localStorage.password == inputValue) {


                $location.path("/dashboard");
                if (!$rootScope.$$phase) $rootScope.$apply()
                swal.close();


            } else {
                swal.showInputError("Wrong password");
                return false;
            }

        });
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
            when('/settings', {
                templateUrl: 'partial/settings.html',
                controller: 'SettingsCtrl'
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

    }]).config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'languages/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('enUS');

}).directive('classRoute', function ($rootScope, $route) {
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
            localStorage.password = $scope.ballet_password;
            Users.insert({username: $scope.username, password: $scope.password}, function (error, data) {
                console.log(error);
                console.log(data[0]);

                sessionStorage.userId = data[0].username;

                $location.path("/dashboard");
                if (!$scope.$$phase) $scope.$apply()
            });
        };
        Users.count(function (error, count) {
            console.log(error);
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
                    swal("Error", "Invalid Username or password", "error");
                }
            });


        }


    })
    .controller('VoteCtrl', function ($scope, $rootScope, $location) {
        $scope.select = function (id) {
            sel = "#cb-" + id;
            $(sel).prop("checked", true);

            $scope.current = id;
            Candidate.update({_id: $scope.current}, {$inc: {vote: 1}}, {upsert: true}, function (error, data) {
                $scope.current = null;
                $scope.$apply();
                updateData($rootScope);
                swal({
                    title: "Thank you",
                    text: "You vote has been submitted",
                    type: "success",
                    showCancelButton: true,
                    confirmButtonText: "New Ballet",
                    cancelButtonText: "Dashboard",
                    closeOnConfirm: false,
                    closeOnCancel: false,
                    allowEscapeKey: false

                }, function (isConfirm) {
                    swal({
                        title: "Admin Password",
                        text: "Please enter Admin password",
                        type: "input",
                        closeOnConfirm: false,
                        allowEscapeKey: false,
                        animation: "slide-from-top",
                        inputPlaceholder: "Enter Password", inputType: "password"
                    }, function (inputValue) {
                        if (inputValue === false) return false;
                        if (inputValue === "") {
                            swal.showInputError("You need to Enter Password!");
                            return false
                        }
                        if (localStorage.password == inputValue) {

                            swal.close();

                            if (isConfirm) {


                            } else {
                                $location.path("/dashboard");
                                if (!$scope.$$phase) $scope.$apply()

                            }
                        } else {
                            swal.showInputError("Wrong password");
                            return false;
                        }

                    });

                });
            })

        }


    })
    .controller('DashBoardCtrl', function ($scope, $rootScope, $location) {
        if (sessionStorage.userId == null) {
            $location.path("/login");
        }
        $rootScope.username = sessionStorage.userId;


    })
    .controller('CandidateCtrl', function ($scope, $rootScope) {

        $scope.saveCandidate = function () {

            icon = $("#icon").val();
            Candidate.insert({name: $scope.candidate.name, icon: icon});
            updateData($rootScope);

        };

    }).controller('SettingsCtrl', function ($scope) {
        $scope.config = {"name": localStorage.schoolName};
        $scope.saveSettings = function () {
            if ($scope.config.oldPassword == null || $scope.config.oldPassword == "") {
                swal("Password", "You Need to enter Current password to update Settings", 'error');
                return;
            }
            Users.findOne({username: sessionStorage.userId}, function (error, data) {
                if (data.password == $scope.config.oldPassword) {
                    localStorage.schoolName = $scope.config.name;
                    if ($scope.config.password != "")
                        localStorage.password = $scope.config.password;

                    Users.update({username: data.username}, {$set: {password: $scope.config.newPassword}}, function (error, count) {

                        swal("Updated", "Settings Has been Updated", 'success');
                    })

                } else {
                    swal("Password", "Your Current password is Wrong", 'error');

                }

            });


        }
    })


