import { canDisplay } from "../utils/can-display";
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
    visualize(type, targets = [this.player]) {
        if (!this.isValid)
            return false;
        switch (type) {
            case "dot":
                this.drawDots(targets);
                break;
            case "line":
                this.drawLines(targets);
                break;
            case "surface":
                this.drawSurface(targets);
                break;
        }
        ;
        return true;
    }
    drawDots(targets) {
        const minPos = this.getMinPos();
        const maxPos = this.getMaxPos();
        for (const player of targets) {
            const drawDot = (x, y, z) => {
                const vector = { x, y, z };
                if (!canDisplay(player, vector, 60))
                    return;
                player.spawnParticle("minecraft:redstone_repeater_dust_particle", vector);
            };
            for (let x = minPos.x; x <= maxPos.x + 1; x += 1) {
                drawDot(x, minPos.y, minPos.z);
                drawDot(x, minPos.y, maxPos.z + 1);
                drawDot(x, maxPos.y + 1, minPos.z);
                drawDot(x, maxPos.y + 1, maxPos.z + 1);
            }
            for (let y = minPos.y; y <= maxPos.y + 1; y += 1) {
                drawDot(minPos.x, y, minPos.z);
                drawDot(minPos.x, y, maxPos.z + 1);
                drawDot(maxPos.x + 1, y, minPos.z);
                drawDot(maxPos.x + 1, y, maxPos.z + 1);
            }
            for (let z = minPos.z; z <= maxPos.z + 1; z += 1) {
                drawDot(minPos.x, minPos.y, z);
                drawDot(minPos.x, maxPos.y + 1, z);
                drawDot(maxPos.x + 1, minPos.y, z);
                drawDot(maxPos.x + 1, maxPos.y + 1, z);
            }
        }
    }
    drawLines(targets) {
        const minPos = this.getMinPos();
        const maxPos = this.getMaxPos();
        for (const player of targets) {
            const drawLine = (type, x, y, z) => {
                const vector = { x, y, z };
                if (!canDisplay(player, vector, 70))
                    return;
                player.spawnParticle(`typidoyun:line_${type}`, vector);
            };
            for (let x = minPos.x; x <= maxPos.x; x += 1) {
                drawLine("zx", x, minPos.y, minPos.z - 0.01);
                drawLine("zx", x, minPos.y, maxPos.z + 1.01);
                drawLine("zx", x, maxPos.y + 0.875, minPos.z - 0.01);
                drawLine("zx", x, maxPos.y + 0.875, maxPos.z + 1.01);
                drawLine("yx", x, minPos.y - 0.01, minPos.z);
                drawLine("yx", x, minPos.y - 0.01, maxPos.z + 0.875);
                drawLine("yx", x, maxPos.y + 1.01, minPos.z);
                drawLine("yx", x, maxPos.y + 1.01, maxPos.z + 0.875);
            }
            for (let y = minPos.y; y <= maxPos.y; y += 1) {
                drawLine("xy", minPos.x - 0.01, y, minPos.z);
                drawLine("xy", minPos.x - 0.01, y, maxPos.z + 0.875);
                drawLine("xy", maxPos.x + 1.01, y, minPos.z);
                drawLine("xy", maxPos.x + 1.01, y, maxPos.z + 0.875);
                drawLine("zy", minPos.x, y, minPos.z - 0.01);
                drawLine("zy", minPos.x, y, maxPos.z + 1.01);
                drawLine("zy", maxPos.x + 0.875, y, minPos.z - 0.01);
                drawLine("zy", maxPos.x + 0.875, y, maxPos.z + 1.01);
            }
            for (let z = minPos.z; z <= maxPos.z; z += 1) {
                drawLine("xz", minPos.x - 0.01, minPos.y, z);
                drawLine("xz", minPos.x - 0.01, maxPos.y + 0.875, z);
                drawLine("xz", maxPos.x + 1.01, minPos.y, z);
                drawLine("xz", maxPos.x + 1.01, maxPos.y + 0.875, z);
                drawLine("yz", minPos.x, minPos.y - 0.01, z);
                drawLine("yz", maxPos.x + 0.875, minPos.y - 0.01, z);
                drawLine("yz", minPos.x, maxPos.y + 1.01, z);
                drawLine("yz", maxPos.x + 0.875, maxPos.y + 1.01, z);
            }
        }
    }
    drawSurface(targets) {
        const minPos = this.getMinPos();
        const maxPos = this.getMaxPos();
        for (const player of targets) {
            const drawSurface = (type, x, y, z) => {
                const vector = { x, y, z };
                if (!canDisplay(player, vector, 40))
                    return;
                player.spawnParticle(`typidoyun:surface_${type}`, vector);
            };
            for (let x = minPos.x; x <= maxPos.x; x += 1) {
                for (let y = minPos.y; y <= maxPos.y; y += 1) {
                    drawSurface("z", x, y, minPos.z + 0.99);
                    drawSurface("z", x, y, maxPos.z + 2.01);
                }
            }
            for (let y = minPos.y; y <= maxPos.y; y += 1) {
                for (let z = minPos.z; z <= maxPos.z; z += 1) {
                    drawSurface("x", minPos.x - 0.01, y, z);
                    drawSurface("x", maxPos.x + 1.01, y, z);
                }
            }
            for (let z = minPos.z; z <= maxPos.z; z += 1) {
                for (let x = minPos.x; x <= maxPos.x; x += 1) {
                    drawSurface("y", x, minPos.y - 1.01, z);
                    drawSurface("y", x, maxPos.y + 0.01, z);
                }
            }
        }
    }
}
