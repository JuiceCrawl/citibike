const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https
    .get(url, function(response) {
      // zip response and write to file
      response.pipe(zlib.createGzip()).pipe(file);
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

var downloadStationAndPoints = function() {
  var timestamp = new Date().getTime();
  var stationsUrl = 'https://feeds.citibikenyc.com/stations/stations.json';
  var pointsUrl = 'https://bikeangels-api.citibikenyc.com/bikeangels/v1/scores';
  var stationsDest = `${__dirname}/data/stations_${timestamp}_.json.gz`;
  var pointsDest = `${__dirname}/data/points_${timestamp}_.json.gz`;
  var cb = function(err) {
    if (err) {
      console.log('error in download at time:', timestamp, ', message:', err);
    }
  };
  download(stationsUrl, stationsDest, cb);
  download(pointsUrl, pointsDest, cb);
};

// run
downloadStationAndPoints();
