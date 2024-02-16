import { Player } from "@minecraft/server";

export const sendMessage = (player: Player, message: string) => {
    player.sendMessage(` §5> §f${message}`);
}