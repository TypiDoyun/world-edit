import { BlockTypes, system } from "@minecraft/server";
import { Command } from "../classes/command";
import { PosManager } from "../classes/pos-manager";
const argumentTypes = [];
export default new Command({
    name: "cut",
    description: "Remove the selected area",
    usage: "cut",
    aliases: [],
    permission: "AdminOnly",
    argumentTypes,
    onExecute(player, args) {
        if (!PosManager.hasPosState(player))
            return;
        const posState = PosManager.getPosState(player);
        const dimension = posState.getFirstPos().dimension;
        const air = BlockTypes.get("minecraft:air");
        posState.save();
        posState.iterate(async (area) => {
            const minPos = area.getMinPos();
            const maxPos = area.getMaxPos();
            await new Promise((resolve, reject) => {
                system.run(() => {
                    dimension.fillBlocks(minPos, maxPos, air);
                    resolve(null);
                });
            });
        });
    },
    onHelp(player) {
    }
});
