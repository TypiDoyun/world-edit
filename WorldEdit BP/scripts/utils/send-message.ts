import { Player } from "@minecraft/server";

export const sendMessage = (player: Player, message: string, color: string = "5") => {
    player.sendMessage(` §${color}> §f${message}`);
}