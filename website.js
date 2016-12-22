var monitor = require('product-monitor');
var server = monitor({
  "serverPort": 9000,
  "productInformation": {
    "title": "Gamebot Monitor",
  },
  "userContentPath": "website"
});
