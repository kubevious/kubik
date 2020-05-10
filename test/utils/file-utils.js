const path = require('path');
const fs = require('fs');
const _ = require('the-lodash');


module.exports.readJsonOrJsData = function(name)
{
    if (module.exports.fileExists(name + '.js'))
    {
        return module.exports.readModule(name);
    }
    else if (module.exports.fileExists(name + '.json'))
    {
        return module.exports.readJsonData(name + '.json');
    }
    throw new Error("File not found: " + name);
}

module.exports.readModule = function()
{
    var parts = ['..', 'data'];
    parts = _.concat(parts, arguments);
    var filePath = path.join.apply(null, parts);
    return require(filePath);
}

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

module.exports.fileExists = function(name)
{
    const filePath = path.resolve(__dirname, '..', 'data', name);
    return fs.existsSync(filePath);
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