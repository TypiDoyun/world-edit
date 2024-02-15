export class PosState {
    firstPos;
    secondPos;
    player;
    constructor(player) {
        const { dimension, location: { x, y, z } } = player;
        this.player = player;
        this.firstPos = { dimension, x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
        this.secondPos = { dimension, x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
    }
    getFirstPos() {
        return this.firstPos;
    }
    getSecondPos() {
        return this.secondPos;
    }
    getMinPos() {
        return {
            dimension: this.firstPos.dimension,
            x: Math.min(this.firstPos.x, this.secondPos.x),
            y: Math.min(this.firstPos.y, this.secondPos.y),
            z: Math.min(this.firstPos.z, this.secondPos.z),
        };
    }
    getMaxPos() {
        return {
            dimension: this.firstPos.dimension,
            x: Math.max(this.firstPos.x, this.secondPos.x),
            y: Math.max(this.firstPos.y, this.secondPos.y),
            z: Math.max(this.firstPos.z, this.secondPos.z),
        };
    }
    setFirstPos(location) {
        this.firstPos = location;
    }
    setSecondPos(location) {
        this.secondPos = location;
    }
    get isValid() {
        return this.firstPos.dimension.id === this.secondPos.dimension.id && this.player.dimension.id === this.firstPos.dimension.id;
    }
}
