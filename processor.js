const fs = require('fs');
const pgp = require('pg-promise')(/*options*/);
const connection = require('./keys').connection;
const utils = require('./utils');
const db = pgp(connection);
const dataFolder =  __dirname +'/data/';

function processFiles() {
  //get files
  fs.readdir(dataFolder, (err, files) => {
    files.forEach(async file => {
      //read files
      var filePath = dataFolder + file;
      var content = await utils.readFile(filePath, file);
      if (!content) return;
      //parse to DB
      var type = file.split('_')[0];
      switch (type) {
        case 'stations':
          processStationFile(file, content);
          break;
        case 'points':
          processPointsFile(file, content);
          break;
        default:
          console.log(`Wrong Type. File name is: ${type}`);
          return;
      }
      //remove file
      fs.unlinkSync(filePath);
    });
  });

  function processStationFile(file, content) {
    var executionTime = new Date(content.executionTime).toISOString();
    var downloadTime = new Date(parseInt(file.split('_')[1], 10)).toISOString();
    var stationBeanList = content.stationBeanList;
    stationBeanList.forEach(function(station) {
      station.stationId = station.id;
      delete station.id;
      station.executionTime = executionTime;
      station.downloadTime = downloadTime;
      const query = pgp.helpers.insert(station, null, 'citibike_stations');
      db.none(query).catch(error => {
        console.log('err', error);
        console.log('FILE:', file, 'CONTENT:', content);
      });
    });
  }

  function processPointsFile(file, content) {
    var downloadTime = new Date(parseInt(file.split('_')[1], 10)).toISOString();
    var stations = content.stations;
    var stationIds = Object.keys(stations);
    stationIds.forEach(station => {
      const formatted = { stationId: station, points: stations[station], downloadTime };
      const query = pgp.helpers.insert(formatted, null, 'citibike_points');
      db.none(query).catch(error => {
        console.log('err', error);
        console.log('FILE:', file, 'CONTENT:', content);
      });
    });
  }
}

// run
processFiles();
