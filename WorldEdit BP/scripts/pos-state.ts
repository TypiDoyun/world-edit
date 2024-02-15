import { DimensionLocation, Player, world } from "@minecraft/server";

export class PosState {
    private firstPos: DimensionLocation;
    private secondPos: DimensionLocation;
    private player: Player;

    constructor(player: Player) {
        const { dimension, location: { x, y, z } } = player;

        this.player = player;
        this.firstPos = { dimension, x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
        this.secondPos = { dimension, x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
    }

    public getFirstPos(): DimensionLocation {
        return this.firstPos;
    }

    public getSecondPos(): DimensionLocation {
        return this.secondPos;
    }

    public getMinPos(): DimensionLocation {
        return {
            dimension: this.firstPos.dimension,
            x: Math.min(this.firstPos.x, this.secondPos.x),
            y: Math.min(this.firstPos.y, this.secondPos.y),
            z: Math.min(this.firstPos.z, this.secondPos.z),
        }
    }

    public getMaxPos(): DimensionLocation {
        return {
            dimension: this.firstPos.dimension,
            x: Math.max(this.firstPos.x, this.secondPos.x),
            y: Math.max(this.firstPos.y, this.secondPos.y),
            z: Math.max(this.firstPos.z, this.secondPos.z),
        }
    }

    public setFirstPos(location: DimensionLocation) {
        this.firstPos = location;
    }

    public setSecondPos(location: DimensionLocation) {
        this.secondPos = location;
    }

    public get isValid(): boolean {
        return this.firstPos.dimension.id === this.secondPos.dimension.id && this.player.dimension.id === this.firstPos.dimension.id;
    }
}