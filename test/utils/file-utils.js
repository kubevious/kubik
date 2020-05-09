const path = require('path');
const fs = require('fs');

module.exports.readFileContents = function(name)
{
    const dirPath = path.resolve(__dirname, '..', 'data', name);
    var entries = fs.readdirSync(dirPath, { withFileTypes: true });
    var files = {};
    for(var file of entries.filter(x => !x.isDirectory()))
    {
        var fullName = path.join(dirPath, file.name);
        files[file.name] = fs.readFileSync(fullName).toString();
    }
    return files;
}

module.exports.listDirectories = function(name)
{
    const dirPath = path.resolve(__dirname, '..', 'data', name);
    var entries = fs.readdirSync(dirPath, { withFileTypes: true });
    var paths = [];
    for(var entry of entries.filter(x => x.isDirectory()))
    {
        var fullName = path.join(dirPath, entry.name);
        paths.push({
            name: entry.name,
            path: fullName
        });
    }
    return paths;
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