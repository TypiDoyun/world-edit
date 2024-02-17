import { Command } from "../classes/command";
const argumentTypes = ["Number"];
export default new Command({
    name: "up",
    description: "Remove the selected area",
    usage: "up",
    aliases: [],
    permission: "AdminOnly",
    argumentTypes,
    onExecute(player, args) {
    },
    onHelp(player) {
    }
});
