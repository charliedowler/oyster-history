var Oyster = require('oyster');
var request = require('request');
var cheerio = require('cheerio');
var jsdom = require('jsdom');

Oyster.Oyster.prototype.balance = function(card, callback) {
  var oyster = this;
  callback = callback || card;
  request({
    uri: 'https://oyster.tfl.gov.uk/oyster/entry.do',
    followRedirect: true,
    headers: {
      'referrer': 'https://oyster.tfl.gov.uk/oyster/entry.do',
      'user-agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.4) Gecko/20030624 Netscape/7.1 (ax)'
    },
    jar: this.jar
  }, function(err, res, body) {
    if(err) return callback(err);
    oyster.qs = body.match(/_qs=_qv%[a-z0-9]+/i);
    callback(null, body.match(/Balance: &pound;([0-9|\.]+)/)[1]);
  });
};

Oyster.Oyster.prototype.history = function(callback) {
  request({
    uri: 'https://oyster.tfl.gov.uk/oyster/journeyDetailsPrint.do?' + this.qs,
    followRedirect: true,
    headers: {
      'referrer': 'https://oyster.tfl.gov.uk/oyster/journeyHistory.do',
      'user-agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.4) Gecko/20030624 Netscape/7.1 (ax)'
    },
    jar: this.jar
  }, function(err, res, body) {
    if(err) return callback(err);
    toTable(cheerio.load(body).html('table.journeyhistory'), callback);
  });
};

function toTable(html, callback) {
  jsdom.env({html: html, scripts: ["http://code.jquery.com/jquery.js", "https://raw.github.com/charliedowler/table-to-json/master/src/jquery.tabletojson.js"], done: function(errors, window) {
    var $ = window.$;

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
    oyster.balance(function(err, balance) {
      if(err) throw err;
      oyster.history(callback);
    });
  });
};