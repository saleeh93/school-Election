var gui = require('nw.gui');
var Engine = require('tingodb')();
var db = new Engine.Db(gui.App.dataPath + '', {});
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
    $rootScope.fields = {
        language: 'enUS'
    };

    $translate.use($rootScope.fields.language);

    $rootScope.language = "ml_IN";
    updateData($rootScope);
    $rootScope.removeCandidate = function (item) {
        swal({
            title: "Delete",
            text: "Do you want to delete candidate ",
            type: "error",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: false,
            allowEscapeKey: false

        }, function (isConfirm) {
            if (isConfirm)
                Candidate.remove({_id: item}, {}, function (err, numRemoved) {
                    updateData($rootScope);
                    toastr.info('Candidate Removed ');

                });
            swal.close();
        });
    }
    $rootScope.logout = function () {
        sessionStorage.removeItem("userId");
        $location.path("/login");
        if (!$rootScope.$$phase) $rootScope.$apply()

    };
    $rootScope.changeLang = function () {

        $translate.use($rootScope.fields.language);


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
//    $translateProvider.preferredLanguage('ml_IN');

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

                sessionStorage.userId = data[0].username;

                $location.path("/dashboard");
                if (!$scope.$$phase) $scope.$apply()
            });
        };
        Users.count(function (error, count) {
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
            Candidate.insert({name: $scope.candidate.name, icon: icon}, function (error, data) {
                $("#icon").val("");
                toastr.info('Added ' + $scope.candidate.name);
                $scope.candidate.name = "";


            });
            updateData($rootScope);

        };

    })
    .controller('SettingsCtrl', function ($scope, $rootScope) {
        $scope.config = {"name": localStorage.schoolName};
        $scope.saveSettings = function () {
            localStorage.schoolName = $scope.config.name;

            $rootScope.schoolName = localStorage.schoolName;
            toastr.info('Settings Updated');


        };
        $scope.updateBalletPassword = function () {
            localStorage.password = $scope.config.password;
            toastr.info('Settings Updated');

        };
        $scope.updatePassword = function () {
            if ($scope.config.oldPassword == null || $scope.config.oldPassword == "") {
                swal("Password", "You Need to enter Current password to update Settings", 'error');
                return;
            }
            Users.findOne({username: sessionStorage.userId}, function (error, data) {
                if (data.password == $scope.config.oldPassword) {

                    if ($scope.config.newPassword != "")
                        Users.update({username: data.username}, {$set: {password: $scope.config.newPassword}}, function (error, count) {
                            swal("Updated", "Settings Has been Updated", 'success');
                        })
                    else
                        swal("Updated", "Settings Has been Updated", 'success');

                } else {
                    swal("Password", "Your Current password is Wrong", 'error');

                }

            });


        }
    })


