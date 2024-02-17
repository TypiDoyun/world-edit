import { world } from "@minecraft/server";
export const isHost = (player) => {
    return player.name === world.getDynamicProperty("typidoyun:hostname");
};
