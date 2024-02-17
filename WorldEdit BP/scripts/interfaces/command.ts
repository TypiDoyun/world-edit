import { Player } from "@minecraft/server";

export type CommandPermission = "None" | "AdminOnly" | "HostOnly";
export type CommandArgument = string | number | boolean | Player;
export type PositionTypes = "PositionX" | "PositionY" | "PositionZ" | "BlockPositionX" | "BlockPositionY" | "BlockPositionZ";
export type ArgumentType = `${"String" | "Number" | PositionTypes | "Boolean" | "Player"}${"" | "?"}`;
export type ArgumentTypes = readonly ArgumentType[];

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
type SplitOf<T extends string, U extends string> = T extends `${infer S extends string}${U}${infer R extends string}` ? [ S, ...(R extends "" ? [] : SplitOf<R, U>) ] : [ T ];
type JoinOf<T extends string[], U extends string> = T extends [ infer S extends string, ...infer R extends string[] ] ? `${S}${R extends [] ? "" : `${U}${JoinOf<R, U>}`}` : "";
type EndOf<T extends string> = SplitOf<T, ""> extends [ ...string[], infer U extends string ] ? U : unknown;
type BodyOf<T extends string> = SplitOf<T, ""> extends [ ...infer U extends string[], string ] ? JoinOf<U, ""> : never;
type ConvertArgumentType<T extends string> = T extends "String" ? string : (
                                                    T extends "Number" | PositionTypes ? number : (
                                                    T extends "Boolean" ? boolean : (
                                                    T extends "Player" ? Player : (
                                                    EndOf<T> extends "?" ? (ConvertArgumentType<BodyOf<T>> | undefined) : never))));
type UnionArgument<T extends readonly ArgumentType[]> = Writeable<T> extends Writeable<[ infer S extends ArgumentType, ...infer U extends ArgumentType[] ]> ? ConvertArgumentType<S> | UnionArgument<U> : (T extends ArgumentType ? ConvertArgumentType<T> : never);
export type CommandArguments<T extends ArgumentTypes> =
    Writeable<T> extends Writeable<[ infer U extends ArgumentType, ...infer S extends Writeable<ArgumentTypes> ]> ?
    [ ConvertArgumentType<U>, ...CommandArguments<S> ] : [ ];


export interface ICommand<T extends ArgumentTypes> {
    name: string;
    description: string;
    usage: string;
    aliases: string[];
    permission: CommandPermission;
    argumentTypes: T | Readonly<T>;

    onExecute(player: Player, args: CommandArguments<T>): void;
    onHelp(player: Player): void;
}