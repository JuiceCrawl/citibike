var https = require('https');
var fs = require('fs');

function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https
    .get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on('error', function(err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
}

var downloadStationAndPoints = function(cb) {
  console.log('downloading...');
  var timestamp = new Date().getTime();
  var stationsUrl = 'https://feeds.citibikenyc.com/stations/stations.json';
  var pointsUrl = 'https://bikeangels-api.citibikenyc.com/bikeangels/v1/scores';
  var stationsDest = `data/stations_${timestamp}_.json`;
  var pointsDest = `data/points_${timestamp}_.json`;
  var cb = function(result) {
    console.log('finished collection', result ? result : timestamp);
  };
  download(stationsUrl, stationsDest, cb);
  download(pointsUrl, pointsDest, cb);
};

setInterval(function() {
  downloadStationAndPoints();
}, 5000);
