import { DimensionLocation } from "@minecraft/server";

export const positionEquals = (position1: DimensionLocation, position2: DimensionLocation) => {
    return position1.dimension.id === position2.dimension.id &&
        position1.x === position2.x &&
        position1.y === position2.y &&
        position1.z === position2.z;
}