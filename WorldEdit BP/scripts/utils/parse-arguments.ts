import { Player, world } from "@minecraft/server";
import { Command } from "../classes/command";
import { ArgumentType, ArgumentTypes, CommandArgument } from "../interfaces/command";
import { sendMessage } from "./send-message";

const getPrimitiveType = (type: ArgumentType) => {
    const isType = (t: string) => {
        return type === t || type.replace("?", "") === t;
    }

    if (isType("String")) return "String";
    else if ([ "Number", "PositionX", "PositionY", "PositionZ", "BlockPositionX", "BlockPositionY", "BlockPositionZ" ].some(t => isType(t))) return "Number";
    else if (isType("Boolean")) return "Boolean";
    else if (isType("Player")) return "Player";
    else return "String";
}

export const parseArguments = (origin: Player, command: Command<ArgumentTypes>, rawArguments: string) => {
    const args: CommandArgument[] = [];
    const types: CommandArgument[] = [];
    
    let tempArgument: string = "";
    let isQuoted = false;
    let inQuotes = false;
    let isEscaped = false;
    let isErrorOccurred = false;
    let stop = false;

    console.log(rawArguments);

    const appendToTemp = (str: string) => {
        tempArgument = tempArgument + str;
    }

    const positionReg = /\~(\d+.\d)?/;

    const pushTemp = () => {
        if (tempArgument === "") return;
        if (isErrorOccurred) return;

        let argumentType;
        let convertedArg: CommandArgument;

        if (tempArgument.startsWith("@")) {
            argumentType = "Player";

            convertedArg = "It'll be player :)";
        }
        else if (isQuoted) {
            argumentType = "String";

            convertedArg = tempArgument.slice(1, tempArgument.length - 1);
        }
        else if (!isNaN(+tempArgument)) {
            argumentType = "Number";

            convertedArg = +tempArgument;
        }
        else if (tempArgument === "true") {
            argumentType = "Boolean";

            convertedArg = true;
        }
        else if (tempArgument === "false") {
            argumentType = "Boolean";

            convertedArg = false;
        } else {
            argumentType = "String";

            if (positionReg.test(tempArgument)) argumentType = "Number";

            convertedArg = tempArgument;
        }

        if (args.length + 1 > command.argumentTypes.length) {
            isErrorOccurred = true;
            sendMessage(origin, `Syntax error: Unexpected "§c${tempArgument}§f": at argument ${args.length + 1}`, "c");
            return;
        }

        const requiredType = command.argumentTypes[args.length];
        const primitiveType = getPrimitiveType(requiredType);
        
        if (argumentType !== primitiveType) {
            isErrorOccurred = true;
            sendMessage(origin, `Syntax error: Unexpected "§c${tempArgument}§f": at argument ${args.length + 1}`, "c");
            sendMessage(origin, `A type "§c${primitiveType}§f" argument is required, but a type "§c${argumentType}§f" argument was received.`, "c");
            return;
        }

        
        if (argumentType === "Player") {
            const playerName = isQuoted ? 
            tempArgument.slice(2, tempArgument.length - 1) :
            tempArgument.substring(1);
            
            const player = world.getAllPlayers().find(player => player.name === playerName);
            
            if (!player) {
                isErrorOccurred = true;
                sendMessage(origin, `Can't find a player named "§c${playerName}§f"`, "c");
                return;
            }
            
            convertedArg = player;
        }
        else if (argumentType === "Number" && typeof convertedArg === "string") {
            if (positionReg.test(convertedArg) && (requiredType.startsWith("Position") || requiredType.startsWith("BlockPosition"))) {
                const axis = requiredType.slice(-1).toLowerCase() as "x" | "y" | "z";
                const value = convertedArg.match(positionReg)![1];

                convertedArg = origin.location[axis] + (value === undefined ? 0 : +value);

                if (requiredType.startsWith("Block")) convertedArg = Math.floor(convertedArg);
            }
        }

        types.push(argumentType);
        args.push(convertedArg);
        tempArgument = "";
        isQuoted = false;
    }

    for (let i = 0; i < rawArguments.length; i++) {
        const char = rawArguments[i];
        const prevChar = i == 0 ? "" : rawArguments[i - 1];

        if (isErrorOccurred) continue;
        if (stop) continue;

        if (prevChar !== "\\") isEscaped = false;

        if (char === "\\") {
            if (isEscaped) {
                appendToTemp(char);
                isEscaped = false;
            }
            else isEscaped = !isEscaped;
        }
        else if (char === "\"") {
            if (!isEscaped) {
                if (inQuotes) isQuoted = true;
                else if (tempArgument !== "" && tempArgument !== "@") {
                    isErrorOccurred = true;
                    sendMessage(origin, `Syntax error: Unexpected "§c${tempArgument}"§f": at argument ${args.length + 1}"`, "c");
                    continue;
                }
                
                inQuotes = !inQuotes;
            }

            appendToTemp(char);
        }
        else if (char === " ") {
            if (!inQuotes) pushTemp();
        }
        else if (!inQuotes && isQuoted) {
            isErrorOccurred = true;
            sendMessage(origin, `Syntax error: Unexpected "§c${tempArgument}${char}§f": at argument ${args.length + 1}"`, "c");
            continue;
        }
        else appendToTemp(char);
    }

    pushTemp();

    const minLength = command.argumentTypes.filter(arg => !arg.endsWith("?")).length;

    if (minLength > args.length) {
        if (!isErrorOccurred) sendMessage(origin, `Syntax error: Unexpected "": at argument ${args.length + 1}"`, "c");
        isErrorOccurred = true;
    }

    return {
        isSuccess: !isErrorOccurred,
        arguments: args,
        types
    };
}