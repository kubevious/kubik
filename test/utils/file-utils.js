const path = require('path');
const fs = require('fs');

module.exports.readSamples = function(name)
{
    const dirPath = path.resolve(__dirname, '..', '..', 'samples', name);
    var fileNames = fs.readdirSync(dirPath);
    var files = {}
    for(var name of fileNames)
    {
        var fullName = path.join(dirPath, name);
        files[name] = fs.readFileSync(fullName).toString();
    }
    return files;
}