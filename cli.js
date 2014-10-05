var argv = require('minimist')(process.argv.slice(2));
var TravelHistory = require('./');

if (!argv.u || !argv.p) {
  throw new Error('Missing arguments u and or p. Check the README for usage instructions.');
}

TravelHistory(argv.u, argv.p, function(err, history) {
  console.log(history);
});