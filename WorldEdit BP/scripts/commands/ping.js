import { Command } from "../classes/command";
import { sendMessage } from "../utils/send-message";
const argumentTypes = ["String?"];
export default new Command({
    name: "ping",
    description: "This command says to pong",
    usage: "ping [message: string]",
    aliases: [],
    permission: "None",
    argumentTypes,
    onExecute(player, args) {
        const [message] = args;
        sendMessage(player, `Pong!`);
        if (!message)
            return;
        sendMessage(player, message);
    },
    onHelp(player) {
    }
});
