import { BlockTypes, system } from "@minecraft/server";
import { Command } from "../classes/command";
import { PosManager } from "../classes/pos-manager";

const argumentTypes = [ "Number" ] as const;

export default new Command<typeof argumentTypes>({
    name: "up",
    description: "Remove the selected area",
    usage: "up",
    aliases: [ ],
    permission: "AdminOnly",
    argumentTypes,

    onExecute(player, args) {
        
    },

    onHelp(player) {
        
    }
});