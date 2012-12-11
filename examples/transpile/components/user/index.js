
var user = {
  name: 'TJ',
  age: 25
};

// the name produced by user.jade could
// anything you want, require('./user'),
// require('./template') etc. Best to use
// filename however to prevent confusion
var view = require('./user');

// invoke the view, returning html
module.exports = view({ user: user });