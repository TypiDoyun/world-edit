import { Player, world } from "@minecraft/server";

export const isHost = (player: Player) => {
    return player.name === world.getDynamicProperty("typidoyun:hostname")!;
}