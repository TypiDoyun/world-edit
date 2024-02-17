import { BlockTypes, system } from "@minecraft/server";
import { Command } from "../classes/command";
import { PosManager } from "../classes/pos-manager";
import { sendMessage } from "../utils/send-message";

const argumentTypes = [ ] as const;

export default new Command<typeof argumentTypes>({
    name: "undo",
    description: "Undo the recent action.",
    usage: "undo",
    aliases: [ ],
    permission: "AdminOnly",
    argumentTypes,

    onExecute(player, args) {
        if (!PosManager.hasPosState(player)) return;

        const posState = PosManager.getPosState(player);

        posState.loadLatestHistory();
    },

    onHelp(player) {
        
    }
});