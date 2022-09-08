import { ScriptItem } from "../../processors/script-item";

export type GenericFilterFunc<T> = (args: {item: ScriptItem, prev?: ScriptItem }) => T;
export type GenericFilter<T> = T | GenericFilterFunc<T>;

export interface KeyValueDict {
    [name: string]: string
}

export enum LogicLocationType
{
    child = 'child',
    descendant = 'descendant',
    parent = 'parent',
    ancestor = 'ancestor',
    link = 'link',
}