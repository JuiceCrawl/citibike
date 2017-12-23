const fs = require('fs');
const zlib = require('zlib');

function tryParseJSON(data, file) {
  try {
    var parsedFile = JSON.parse(data);
    if (parsedFile && typeof parsedFile === 'object') {
      return parsedFile;
    }
  } catch (err) {
    console.log('Not valid JSON', file, err);
    return false;
  }
  return false;
}

async function readFile(filePath, file) {
  return new Promise(function(resolve, reject) {
    // unzip file and parse JSON
    var content = '';
    fs
      .createReadStream(filePath)
      .pipe(zlib.createGunzip())
      .on('data', function(data) {
        content += data.toString();
      })
      .on('end', function() {
        var result = tryParseJSON(content, file);
        resolve(result);
      });
  });
}

module.exports = { tryParseJSON, readFile };
