import { Command } from "../classes/command";
import { PosManager } from "../classes/pos-manager";
const argumentTypes = [];
export default new Command({
    name: "undo",
    description: "Undo the recent action.",
    usage: "undo",
    aliases: [],
    permission: "AdminOnly",
    argumentTypes,
    onExecute(player, args) {
        if (!PosManager.hasPosState(player))
            return;
        const posState = PosManager.getPosState(player);
        posState.loadLatestHistory();
    },
    onHelp(player) {
    }
});
