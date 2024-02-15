import { Player } from "@minecraft/server";
import { PosState } from "./pos-state";

export namespace PosManager {
    const posStates = new Map<Player, PosState>();

    export const hasPosState = (player: Player) => {
        return posStates.has(player);
    }

    export const getPosState = (player: Player): PosState => {

        if (posStates.has(player)) return posStates.get(player)!;

        const posState = new PosState(player);
        posStates.set(player, posState);

        return posState;
    }
}