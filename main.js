/**
 * Created by saleeh on 05/05/15.
 */
var gui = require('nw.gui');

var Datastore = require('nedb');


// Of course you can create multiple datastores if you need several
// collections. In this case it's usually a good idea to use autoload for all collections.
db = {};
db.users = new Datastore('data/users.db');
db.members = new Datastore('data/members.db');

// You need to load each database (here we do it asynchronously)
db.users.loadDatabase();
db.members.loadDatabase();
var doc = {username: "admin", password: "admin"};
console.log("Hell");

// Declare app level module which depends on filters, and services
angular.module('myApp', []).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/index',
                controller: IndexCtrl
            }).
            when('#addPost', {
                templateUrl: 'dashboard.html',
                controller: AddPostCtrl
            }).
            when('/readPost/:id', {
                templateUrl: 'partials/readPost',
                controller: ReadPostCtrl
            }).
            when('/editPost/:id', {
                templateUrl: 'partials/editPost',
                controller: EditPostCtrl
            }).
            when('/deletePost/:id', {
                templateUrl: 'partials/deletePost',
                controller: DeletePostCtrl
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }]);