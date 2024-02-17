import { Command } from "../classes/command";
import { ArgumentTypes } from "../interfaces/command";
import Cut from "./cut";
import Ping from "./ping";
import Undo from "./undo";

export const commands = [ Ping, Cut, Undo ] as Command<ArgumentTypes>[];

commands.forEach(command => {
    let hasOptionalArg = false;
    command.argumentTypes.forEach(argType => {
        if (argType.endsWith("?")) hasOptionalArg = true;
        else if (hasOptionalArg) throw new Error(`Optional argument error: command name is ${command.name}`);
    });
})