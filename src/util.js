
const fs = require('fs');

function makeDir(path) {

  const paths = path.split('/');
  const entries = [];
  paths.reduce((entry, tmp) => {
    entries.push(entry);
    return `${entry}/${tmp}`
  });

  entries.push(path);

  entries.forEach(entry => {
    try {
      const stats = fs.statSync(entry);
      if (!stats.isDirectory()) {
        fs.mkdirSync(entry);
      }
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        fs.mkdirSync(entry);
      }
    }
  })
}

function writeFile(file, content) {
  fs.writeFile(file, content, (err) => {
    if (err) {
      throw err;
    }
  });
}

module.exports = {
  makeDir,
  writeFile
};
