import { Player } from "@minecraft/server";
import { ArgumentTypes, CommandArguments, CommandPermission, ICommand } from "../interfaces/command";

export class Command<T extends ArgumentTypes> implements ICommand<T> {
    public static commandPrefix = "-";

    public readonly name: string;
    public readonly description: string;
    public readonly aliases: string[];
    public readonly usage: string;
    public readonly permission: CommandPermission;
    public readonly argumentTypes: T;
    public readonly onExecute: (player: Player, args: CommandArguments<T>) => void;
    public readonly onHelp: (player: Player) => void;

    public constructor(command: ICommand<T>) {
        this.name = command.name;
        this.description = command.description;
        this.usage = command.usage;
        this.aliases = command.aliases;
        this.permission = command.permission;
        this.argumentTypes = command.argumentTypes;
        this.onExecute = command.onExecute;
        this.onHelp = command.onHelp;
    }
}