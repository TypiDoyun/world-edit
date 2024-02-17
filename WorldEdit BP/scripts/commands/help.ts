import { commands as _commands } from "./index";
import { Command } from "../classes/command";
import { sendMessage } from "../utils/send-message";
import { isHost } from "../utils/is-host";

const argumentTypes = [ "String?" ] as const;

export default new Command<typeof argumentTypes>({
    name: "help",
    description: "Provides help of commands",
    usage: "help [commandName: string]",
    aliases: [ "?" ],
    permission: "None",
    argumentTypes,

    onExecute(player, args) {
        const commands = [ ..._commands, this ].sort((a, b) => a.name.localeCompare(b.name)).filter(command => (command.permission === "AdminOnly" && player.isOp()) || (command.permission === "HostOnly" && isHost(player)) || command.permission === "None")
        const [ commandName ] = args;

        if (!commandName) {
            this.onHelp(player);

            player.sendMessage(`\n§a-----§f Command list §a-----§f`);
            player.sendMessage(`${commands.map(command => ` §a-§f ${Command.commandPrefix}${command.usage}`).join("\n")}`);
        }
        else if (commandName === "help" || this.aliases.includes(commandName)) {
            this.onHelp(player);
        }
        else {
            const command = commands.find(command => command.name === commandName || command.aliases.includes(commandName));

            if (!command) return sendMessage(player, `Can't find a command named ${commandName}`, "c");

            player.sendMessage(`\n§a-----§f ${command.name} §a-----§f`);
            sendMessage(player, `${command.description}\n\n§a-----§f ${command.name} Usage §a-----§f`, "a");
            player.sendMessage(` §a-§f ${Command.commandPrefix}${command.usage}\n`);

            command.onHelp(player);
        }
    },

    onHelp(player) {
        player.sendMessage(`\n§a-----§f ${this.name} §a-----§f`);
        sendMessage(player, `${this.description}\n\n§a-----§f ${this.name} Usage §a-----§f`, "a");
        player.sendMessage(` §a-§f ${Command.commandPrefix}${this.usage}\n`);
    }
});