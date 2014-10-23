# node-oyster-history

> Scrape your oyster card journey history

Checkout [oyster-history-cli](https://github.com/charliedowler/oyster-history-cli) to view your oyster history in your command prompt.

## Installation
```sh
$ npm install --save node-oyster-history
```

## Usage

```js
var TravelHistory = require('node-oyster-history');

TravelHistory('mail@example.com', 'p4ssw0rd', function(history) {
    console.log(history);
    //=> Returns array of travel data
    [ { date: 'Tuesday, 30 September 2014 10:33',
    balance: '£23.30',
    charge: '+£20.00',
    journey: 'Topped up,' },
  { date: 'Monday, 29 September 2014 13:33',
    balance: '£4.75',
    charge: '£1.45',
    journey: 'Entered Wimbledon tram stop' },
  { date: 'Monday, 29 September 2014 10:15',
    balance: '£6.20',
    charge: '£1.45',
    journey: 'Entered Wandle Park tram stop' } ]
});
```
