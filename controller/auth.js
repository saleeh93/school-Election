window.dash = window.dash || {};
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

dash.authUser = function (userid, password, callb) {

    /*
     *  response code : 0 - User does not exists
     *  response code : 1 - Sucessfully logged in and User has already filled the settings
     *  response code : 2 - Sucessfully logged in and User has not filled the settings
     *  response code : 3 - Authentication failed
     */

    // fetch the user from DB
    var user = db.users.findOne({
        username: userid,
        password: password
    }, function (error, data) {
        callb(data);
    });
};

dash.signOut = function () {

    /*
     *  Clean localstorage
     */

    localStorage.removeItem('user');
    localStorage.removeItem('settings');
    return 1;
};

var populateUser = function (user) {

    /*
     *  Create a "Session"
     */

    delete user.password; // remove password before creating a "session"

    // if local storage has a user object, the user is logged in 'Duh!'
    localStorage.setItem('user', JSON.stringify(user));

    // check if the user has completed the settings
    var setg = db.settings.findOne({
        uid: user._id
    });
    if (setg) {
        localStorage.setItem('settings', JSON.stringify(setg.settings));
        return 1;
    } else {
        return 2;
    }
};

