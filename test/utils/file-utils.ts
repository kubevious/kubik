import path from 'path';
import fs from 'fs';
import _ from 'the-lodash';

import { RegistryState } from '@kubevious/state-registry';
import { SnapshotInfo } from '@kubevious/state-registry';

export function readRegistryState(name: string)
{
    const jsonData = readJsonData(name);
    const snapshotInfo: SnapshotInfo = {
        date: jsonData.date,
        items: jsonData.items
    };
    const state = new RegistryState(snapshotInfo);
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
    let parts = ['..', 'data'];
    parts = _.concat(parts, args);
    const filePath = path.join.apply(null, parts);
    return require(filePath);
}

export function readFileContents(name: string): Record<string, string>
{
    const dirPath = path.resolve(__dirname, '..', 'data', name);
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files: Record<string, string> = {};
    for(const file of entries.filter(x => !x.isDirectory()))
    {
        const fullName = path.join(dirPath, file.name);
        files[file.name] = fs.readFileSync(fullName).toString();
    }
    return files;
}

export function listDirectories(name: string): Record<string, string>[]
{
    const dirPath = path.resolve(__dirname, '..', 'data', name);
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const paths = [];
    for(const entry of entries.filter(x => x.isDirectory()))
    {
        const fullName = path.join(dirPath, entry.name);
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


const FILE_CACHE : Record<string, string> = {};
export function readFile(name: string): string
{
    const filePath = path.resolve(__dirname, '..', 'data', name);
    if (filePath in FILE_CACHE) {
        return FILE_CACHE[filePath];
    }
    const contents = fs.readFileSync(filePath).toString();
    FILE_CACHE[filePath] = contents;
    return contents;
}

const SNAPSHOT_CACHE : Record<string, SnapshotInfo> = {};
export function readJsonData(name: string): SnapshotInfo
{
    if (name in SNAPSHOT_CACHE) {
        return SNAPSHOT_CACHE[name];
    }
    const contents = readFile(name);
    const json = JSON.parse(contents);
    SNAPSHOT_CACHE[name] = json;
    return json;
}
