var os = require('os');
var ifaces = os.networkInterfaces();

var interfaces = '';

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0
    ;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      interfaces += ifname + ',' + iface.address + '\n';
    } else {
      // this interface has only one ipv4 adress
      interfaces += ifname + ',' + iface.address + '\n';
    }
  });
});

module.exports = interfaces;
