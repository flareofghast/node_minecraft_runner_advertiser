var dgram = require('dgram');
var async = require('async');
var logging = require('winston');
var child_process = require('child_process');
var servers = require('./servers');

(function () {
  //thanks to https://github.com/flareofghast/node-advertiser/blob/master/advert.js
  var udp_broadcaster;
  var UDP_DEST = '255.255.255.255';
  var UDP_PORT = 4445;
  var BROADCAST_DELAY_MS = 4000;

  async.forever(
    function (next) {
      servers.forEach(s => {
        var msg = Buffer.from(s.msg)
        if (msg) {
          if (udp_broadcaster) {
            udp_broadcaster.send(msg, 0, msg.length, UDP_PORT, UDP_DEST);
            } else { proc.stdin.write('stop') }
            udp_broadcaster = dgram.createSocket('udp4');
            udp_broadcaster.bind(UDP_PORT, s.ip);
            udp_broadcaster.on('listening', function () {
              udp_broadcaster.setBroadcast(true);
              udp_broadcaster.send(msg, 0, msg.length, UDP_PORT, UDP_DEST);
            });
            udp_broadcaster.on("error", function (err) {
              logging.error("Cannot bind broadcaster");
            });
          }
        }
      });
      setTimeout(next, BROADCAST_DELAY_MS);
    }
  )
})();

var proc = child_process.spawn('java.exe', ['-Xmx4096M', '-Xms4096M', '-jar', "C:\\Minecraft_Server\\minecraft_server.1.15.2.jar"], { cwd: 'C:\\Minecraft_Server' });

// proc.stdout.pipe(process.stdout);
proc.on('error', err => {
  logging.error(`error: ${err}`);
  process.exit( );
});
proc.on('close', code => {
  logging.debug(`exited with code ${code}`);
  process.exit();
});
