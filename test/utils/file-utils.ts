import path from 'path';
import fs from 'fs';
import _ from 'the-lodash';

import { RegistryState } from '@kubevious/helpers/dist/registry-state';
import { SnapshotInfo } from '@kubevious/helpers/dist/snapshot/types';

export function readRegistryState(name: string)
{
    var jsonData = readJsonData(name);
    var snapshotInfo: SnapshotInfo = {
        date: jsonData.date,
        items: jsonData.items
    };
    var state = new RegistryState(snapshotInfo);
    return state;
}

export function readJsonOrJsData(name: string)
{
    if (fileExists(name + '.js'))
    {
        return readModule(name);
    }
    else if (fileExists(name + '.json'))
    {
        return readJsonData(name + '.json');
    }
    throw new Error("File not found: " + name);
}

export function readModule(...args: string[])
{
    var parts = ['..', 'data'];
    parts = _.concat(parts, args);
    var filePath = path.join.apply(null, parts);
    return require(filePath);
}

export function readFileContents(name: string): Record<string, string>
{
    const dirPath = path.resolve(__dirname, '..', 'data', name);
    var entries = fs.readdirSync(dirPath, { withFileTypes: true });
    var files: Record<string, string> = {};
    for(var file of entries.filter(x => !x.isDirectory()))
    {
        var fullName = path.join(dirPath, file.name);
        files[file.name] = fs.readFileSync(fullName).toString();
    }
    return files;
}

export function listDirectories(name: string): Record<string, string>[]
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

export function fileExists(name: string): boolean
{
    const filePath = path.resolve(__dirname, '..', 'data', name);
    return fs.existsSync(filePath);
}

export function readFile(name: string): string
{
    const filePath = path.resolve(__dirname, '..', 'data', name);
    var contents = fs.readFileSync(filePath).toString();
    return contents;
}

export function readJsonData(name: string): SnapshotInfo
{
    var contents = readFile(name);
    var json = JSON.parse(contents);
    return json;
}
