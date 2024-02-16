import { PosState } from "./pos-state";
export var PosManager;
(function (PosManager) {
    const posStates = new Map();
    PosManager.hasPosState = (player) => {
        return posStates.has(player);
    };
    PosManager.getPosState = (player) => {
        if (posStates.has(player))
            return posStates.get(player);
        const posState = new PosState(player);
        posStates.set(player, posState);
        return posState;
    };
})(PosManager || (PosManager = {}));
