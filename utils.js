const fs = require('fs');

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
    fs.readFile(filePath, 'utf8', function read(err, data) {
      if (err) {
        reject(err);
      }
      var result = tryParseJSON(data, file);
      resolve(result);
    });
  });
}

module.exports = { tryParseJSON, readFile };
