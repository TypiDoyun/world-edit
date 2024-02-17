import { DimensionLocation, Player, system } from "@minecraft/server";
import { canDisplay } from "../utils/can-display";
import { sendMessage } from "../utils/send-message";

type VisualizeType = "dot" | "line" | "surface";
type History = {
    startAt: DimensionLocation,
    structureIds: string[]
}


export class PosState {
    private firstPos: DimensionLocation;
    private secondPos: DimensionLocation;
    private player: Player;
    private histories: History[] = [ ];
    private historyId = 0;

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

    public save(callback: (result: boolean) => void) {
        this.historyId++;

        const history: History = {
            startAt: this.getMinPos(),
            structureIds: []
        }

        system.run(() => {
            const result = this.iterate((posState, xIndex, _, zIndex) => {
                const minPos = posState.getMinPos();
                const maxPos = posState.getMaxPos();
    
                const structureId = `history-${this.historyId}-${xIndex}-${zIndex}`;
    
                history.structureIds.push(structureId);
    
                sendMessage(this.player, `${structureId} saved!`);
                
                this.player.runCommand(`say structure save "${structureId}" ${minPos.x} ${this.getMinPos().y} ${minPos.z} ${maxPos.x} ${this.getMaxPos().y} ${maxPos.z} false disk true`);
                this.player.runCommand(`execute @s ~ ~ ~ structure save "${structureId}" ${minPos.x} ${this.getMinPos().y} ${minPos.z} ${maxPos.x} ${this.getMaxPos().y} ${maxPos.z} false disk true`);
            }, [ 64, 384, 64 ]);
    
            if (result) {
                if (this.histories.length >= 5) this.histories.shift();
    
                this.histories.push(history);
            }
        })

    }

    public loadLatestHistory() {
        const latestHistory = this.histories.pop();

        if (!latestHistory) return;

        const { startAt, structureIds } = latestHistory;

        system.run(() => {
            for (const structureId of structureIds) {
                const [ _, id, xIndex, zIndex ] = structureId.split("-");
                
                sendMessage(this.player, `${structureId} loaded!`);
                
                this.player.runCommand(`structure load "${structureId}" ${startAt.x + +xIndex * 64} ${startAt.y} ${startAt.z + +zIndex * 64} 0_degrees none false true`);
                this.player.runCommand(`structure delete "${structureId}"`);
            }
        });
    }

    public iterate(callback: (posState: PosState, xIndex: number, yIndex: number, zIndex: number) => void, sizes: [ number, number, number ] = [ 31, 31, 31 ]): boolean {
        if (!this.isValid) return false;

        const minPos = this.getMinPos();
        const maxPos = this.getMaxPos();
        const dimension = this.firstPos.dimension;
        const posState = new PosState(this.player);

        let xIndex = -1;
        let yIndex = -1;
        let zIndex = -1;

        for (let x = minPos.x; x <= maxPos.x; x += sizes[0]) {
            xIndex++
            for (let y = minPos.y; y <= maxPos.y; y += sizes[1]) {
                yIndex++
                for (let z = minPos.z; z <= maxPos.z; z += sizes[2]) {
                    zIndex++;

                    posState.setFirstPos({ dimension, x, y, z });
                    posState.setSecondPos({ dimension, x: Math.min(maxPos.x, x + sizes[0] - 1), y: Math.min(maxPos.y, y + sizes[1] - 1), z: Math.min(maxPos.z, z + sizes[2] - 1) });
                    
                    callback(posState, xIndex, yIndex, zIndex);
                }
            }
        }

        return true;
    }

    public get isValid(): boolean {
        return this.firstPos.dimension.id === this.secondPos.dimension.id && this.player.dimension.id === this.firstPos.dimension.id;
    }

    public visualize(type: VisualizeType, targets: Player[] = [ this.player ]): boolean {
        if (!this.isValid) return false;

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
        };

        return true;
    }

    private drawDots(targets: Player[]) {
        const minPos = this.getMinPos();
        const maxPos = this.getMaxPos();

        for (const player of targets) {
            const drawDot = (x: number, y: number, z: number) => {
                const vector = { x, y, z };

                if (!canDisplay(player, vector, 60)) return;
                
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

    private drawLines(targets: Player[]) {
        const minPos = this.getMinPos();
        const maxPos = this.getMaxPos();

        for (const player of targets) {
            const drawLine = (type: "xy" | "xz" | "yx" | "yz" | "zx" | "zy", x: number, y: number, z: number) => {
                const vector = { x, y, z };

                if (!canDisplay(player, vector, 70)) return;
    
                player.spawnParticle(`typidoyun:line_${type}`, vector);
            }

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

    private drawSurface(targets: Player[]) {
        const minPos = this.getMinPos();
        const maxPos = this.getMaxPos();

        for (const player of targets) {
            const drawSurface = (type: "x" | "y" | "z", x: number, y: number, z: number) => {
                const vector = { x, y, z };

                if (!canDisplay(player, vector, 40)) return;
    
                player.spawnParticle(`typidoyun:surface_${type}`, vector);
            }

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