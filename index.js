var Oyster = require('oyster');
var request = require('request');
var cheerio = require('cheerio');
var jsdom = require('jsdom');

Oyster.Oyster.prototype.history = function(callback) {
  var oyster = this;
  /**
  * Visiting entry.do before journeyDetailsPrint.do does some cookie stuff
  * that enables us to view the journey history.
  **/
  request({
    uri: 'https://oyster.tfl.gov.uk/oyster/entry.do',
    jar: oyster.jar
  }, function(err, res, body) {
    request({
      uri: 'https://oyster.tfl.gov.uk/oyster/journeyDetailsPrint.do',
      followRedirect: true,
      headers: {
        'referrer': 'https://oyster.tfl.gov.uk/oyster/journeyHistory.do',
        'user-agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.4) Gecko/20030624 Netscape/7.1 (ax)'
      },
      jar: oyster.jar
    }, function(err, res, body) {
      if(err) return callback(err);
      toTable(cheerio.load(body).html('table.journeyhistory'), callback);
    });
  }.bind(this));
};

function toTable(html, callback) {
  jsdom.env({html: html, scripts: ["http://code.jquery.com/jquery.js", "https://raw.github.com/charliedowler/table-to-json/master/src/jquery.tabletojson.js"], done: function(errors, window) {
    var $ = window.$;
    if (/No pay as you go/.test(html)) {
      callback(null, []);
      return false;
    }
    var before = $(html).tableToJSON();
    var after = [];
    var currentDate;
    for (var i in before) {
      var trip = before[i];
      if (/daily/.test(trip['Journey / Action'])) {
        currentDate = trip['Date / Time'];
      }
      else {
        var formattedTrip = {};
        formattedTrip.date = currentDate + ' ' + trip['Date / Time'];
        formattedTrip.balance = trip.Balance;
        formattedTrip.charge = trip.Charge;
        formattedTrip.journey = trip['Journey / Action'];

        after.push(formattedTrip);
      }
    }

    callback(null, after);
  }});
}

module.exports = function(username, password, callback) {
  var oyster = Oyster(username, password, function(err) {
    if(err) throw err;
    oyster.history(callback);
  });
};
