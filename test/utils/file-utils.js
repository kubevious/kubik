const path = require('path');
const fs = require('fs');

module.exports.readSamples = function(name)
{
    const dirPath = path.resolve(__dirname, '..', 'data', name);
    var fileNames = fs.readdirSync(dirPath);
    var files = {}
    for(var name of fileNames)
    {
        var fullName = path.join(dirPath, name);
        files[name] = fs.readFileSync(fullName).toString();
    }
    return files;
}

module.exports.readFile = function(name)
{
    const filePath = path.resolve(__dirname, '..', 'data', name);
    var contents = fs.readFileSync(filePath).toString();
    return contents;
}

module.exports.readJsonData = function(name)
{
    var contents = module.exports.readFile(name);
    var json = JSON.parse(contents);
    return json;
}