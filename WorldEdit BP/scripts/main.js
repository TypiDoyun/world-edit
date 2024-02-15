import { system, world } from "@minecraft/server";
import { PosManager } from "./pos-manager";
import { sendMessage } from "./send-message";
import { positionEquals } from "./position-equals";
const interfaceItem = "minecraft:wooden_axe";
world.beforeEvents.playerBreakBlock.subscribe(eventData => {
    const { player, itemStack, block: { location: { x, y, z } } } = eventData;
    if (!itemStack)
        return;
    if (itemStack.typeId !== interfaceItem)
        return;
    if (!player.isOp())
        return;
    eventData.cancel = true;
    const posState = PosManager.getPosState(player);
    const dimension = player.dimension;
    const newPos = { dimension, x, y, z };
    posState.setFirstPos(newPos);
    sendMessage(player, `The First position set to    §5|§f { ${x}, ${y}, ${z} }`);
    if (!posState.isValid)
        sendMessage(player, `Warning! §5|§f The first position set in another dimension `);
});
const useDelay = new Map();
world.beforeEvents.itemUseOn.subscribe(eventData => {
    const { source: player, itemStack, block: { location: { x, y, z } } } = eventData;
    if (!itemStack)
        return;
    if (itemStack.typeId !== interfaceItem)
        return;
    if (!player.isOp())
        return;
    const delay = useDelay.get(player);
    const dimension = player.dimension;
    const newPos = { dimension, x, y, z };
    if (delay && delay.delay !== 0 && positionEquals(delay.position, newPos))
        return;
    useDelay.set(player, {
        delay: 10,
        position: newPos
    });
    eventData.cancel = true;
    const posState = PosManager.getPosState(player);
    posState.setSecondPos(newPos);
    sendMessage(player, `The second position set to §5|§f { ${x}, ${y}, ${z} }`);
    if (!posState.isValid)
        sendMessage(player, `Warning! §5|§f The second position set in another dimension `);
});
system.runInterval(() => {
    useDelay.forEach((delay, player) => {
        if (delay.delay <= 0)
            return;
        delay.delay -= 2;
    });
}, 2);
const particleId = "minecraft:redstone_repeater_dust_particle";
const step = 1;
// 위아래 60도
// 양옆 74도
system.runInterval(() => {
    const players = world.getAllPlayers();
    for (const player of players) {
        if (!PosManager.hasPosState(player))
            continue;
        const inventory = player.getComponent("inventory");
        const container = inventory.container;
        const item = container.getItem(player.selectedSlot);
        if (!item)
            continue;
        if (item.typeId !== interfaceItem)
            continue;
        const posState = PosManager.getPosState(player);
        if (!posState.isValid)
            continue;
        const drawDot = (vector) => {
            const direction = {
                x: vector.x - player.location.x,
                y: vector.y - player.location.y,
                z: vector.z - player.location.z
            };
            const distanceSquared = direction.x ** 2 + direction.y ** 2 + direction.z ** 2;
            if (distanceSquared > 1600)
                return;
            const forward = player.getViewDirection();
            const radian = 74 * Math.PI / 180;
            const cosRadian = Math.cos(radian);
            const sinRadian = Math.sin(radian);
            const thetaX = Math.atan2(forward.z, forward.x);
            const cosThetaX = Math.cos(thetaX);
            const cosMThetaX = Math.cos(-thetaX);
            const sinThetaX = Math.sin(thetaX);
            const sinMThetaX = Math.sin(-thetaX);
            const flatForward = {
                x: forward.x * cosMThetaX - forward.z * sinMThetaX,
                y: forward.y,
                z: forward.x * sinMThetaX + forward.z * cosMThetaX
            };
            const thetaY = Math.atan2(flatForward.x, flatForward.y);
            const cosMThetaY = Math.cos(-thetaY);
            const sinMThetaY = Math.sin(-thetaY);
            const semiRight = {
                x: -cosRadian * sinMThetaY,
                y: cosRadian * cosMThetaY,
                z: sinRadian
            };
            const right = {
                x: semiRight.x * cosThetaX - semiRight.z * sinThetaX,
                y: semiRight.y,
                z: semiRight.x * sinThetaX + semiRight.z * cosThetaX
            };
            const semiLeft = {
                x: -cosRadian * sinMThetaY,
                y: cosRadian * cosMThetaY,
                z: Math.sin(-radian)
            };
            const left = {
                x: semiLeft.x * cosThetaX - semiLeft.z * sinThetaX,
                y: semiLeft.y,
                z: semiLeft.x * sinThetaX + semiLeft.z * cosThetaX
            };
            const _up = {
                x: -Math.sin(Math.PI / 2),
                y: Math.cos(Math.PI / 2),
                z: 0
            };
            const semiUp = {
                x: _up.x * cosMThetaY - _up.y * sinMThetaY,
                y: _up.x * sinMThetaY + _up.y * cosMThetaY,
                z: 0
            };
            const up = {
                x: semiUp.x * cosThetaX - semiUp.z * sinThetaX,
                y: semiUp.y,
                z: semiUp.x * sinThetaX + semiUp.z * cosThetaX
            };
            const rightCross = {
                x: direction.y * right.z - direction.z * right.y,
                y: direction.z * right.x - direction.x * right.z,
                z: direction.x * right.y - direction.y * right.x,
            };
            const leftCross = {
                x: direction.y * left.z - direction.z * left.y,
                y: direction.z * left.x - direction.x * left.z,
                z: direction.x * left.y - direction.y * left.x,
            };
            const rightResult = rightCross.x * up.x + rightCross.y * up.y + rightCross.z * up.z;
            const leftResult = leftCross.x * up.x + leftCross.y * up.y + leftCross.z * up.z;
            // sendMessage(player, `${rightResult}`);
            if (rightResult > 0 || leftResult < 0)
                return;
            player.spawnParticle(particleId, vector);
        };
        const drawFace = (type, vector) => {
            const direction = {
                x: vector.x - player.location.x,
                y: vector.y - player.location.y,
                z: vector.z - player.location.z
            };
            const distanceSquared = direction.x ** 2 + direction.y ** 2 + direction.z ** 2;
            if (distanceSquared > 2500)
                return;
            const forward = player.getViewDirection();
            const radian = 74 * Math.PI / 180;
            const cosRadian = Math.cos(radian);
            const sinRadian = Math.sin(radian);
            const thetaX = Math.atan2(forward.z, forward.x);
            const cosThetaX = Math.cos(thetaX);
            const cosMThetaX = Math.cos(-thetaX);
            const sinThetaX = Math.sin(thetaX);
            const sinMThetaX = Math.sin(-thetaX);
            const flatForward = {
                x: forward.x * cosMThetaX - forward.z * sinMThetaX,
                y: forward.y,
                z: forward.x * sinMThetaX + forward.z * cosMThetaX
            };
            const thetaY = Math.atan2(flatForward.x, flatForward.y);
            const cosMThetaY = Math.cos(-thetaY);
            const sinMThetaY = Math.sin(-thetaY);
            const semiRight = {
                x: -cosRadian * sinMThetaY,
                y: cosRadian * cosMThetaY,
                z: sinRadian
            };
            const right = {
                x: semiRight.x * cosThetaX - semiRight.z * sinThetaX,
                y: semiRight.y,
                z: semiRight.x * sinThetaX + semiRight.z * cosThetaX
            };
            const semiLeft = {
                x: -cosRadian * sinMThetaY,
                y: cosRadian * cosMThetaY,
                z: Math.sin(-radian)
            };
            const left = {
                x: semiLeft.x * cosThetaX - semiLeft.z * sinThetaX,
                y: semiLeft.y,
                z: semiLeft.x * sinThetaX + semiLeft.z * cosThetaX
            };
            const _up = {
                x: -Math.sin(Math.PI / 2),
                y: Math.cos(Math.PI / 2),
                z: 0
            };
            const semiUp = {
                x: _up.x * cosMThetaY - _up.y * sinMThetaY,
                y: _up.x * sinMThetaY + _up.y * cosMThetaY,
                z: 0
            };
            const up = {
                x: semiUp.x * cosThetaX - semiUp.z * sinThetaX,
                y: semiUp.y,
                z: semiUp.x * sinThetaX + semiUp.z * cosThetaX
            };
            const rightCross = {
                x: direction.y * right.z - direction.z * right.y,
                y: direction.z * right.x - direction.x * right.z,
                z: direction.x * right.y - direction.y * right.x,
            };
            const leftCross = {
                x: direction.y * left.z - direction.z * left.y,
                y: direction.z * left.x - direction.x * left.z,
                z: direction.x * left.y - direction.y * left.x,
            };
            const rightResult = rightCross.x * up.x + rightCross.y * up.y + rightCross.z * up.z;
            const leftResult = leftCross.x * up.x + leftCross.y * up.y + leftCross.z * up.z;
            if (rightResult > 0 || leftResult < 0)
                return;
            player.spawnParticle(`typidoyun:flat_${type}`, vector);
        };
        const minPos = posState.getMinPos();
        const maxPos = posState.getMaxPos();
        // for (let x = minPos.x; x <= maxPos.x + 1; x += step) {
        //     drawDot({ x, y: minPos.y, z: minPos.z });
        //     drawDot({ x, y: minPos.y, z: maxPos.z + 1 });
        //     drawDot({ x, y: maxPos.y + 1, z: minPos.z });
        //     drawDot({ x, y: maxPos.y + 1, z: maxPos.z + 1 });
        // }
        // for (let y = minPos.y; y <= maxPos.y + 1; y += step) {
        //     drawDot({ x: minPos.x, y, z: minPos.z });
        //     drawDot({ x: minPos.x, y, z: maxPos.z + 1 });
        //     drawDot({ x: maxPos.x + 1, y, z: minPos.z });
        //     drawDot({ x: maxPos.x + 1, y, z: maxPos.z + 1 });
        // }
        // for (let z = minPos.z; z <= maxPos.z + 1; z += step) {
        //     drawDot({ x: minPos.x, y: minPos.y, z });
        //     drawDot({ x: minPos.x, y: maxPos.y + 1, z });
        //     drawDot({ x: maxPos.x + 1, y: minPos.y, z });
        //     drawDot({ x: maxPos.x + 1, y: maxPos.y + 1, z });
        // }
        for (let x = minPos.x; x <= maxPos.x; x += step) {
            for (let y = minPos.y; y <= maxPos.y; y += step) {
                drawFace("z", { x, y, z: minPos.z + 0.99 });
                drawFace("z", { x, y, z: maxPos.z + 2.01 });
            }
        }
        for (let y = minPos.y; y <= maxPos.y; y += step) {
            for (let z = minPos.z; z <= maxPos.z; z += step) {
                drawFace("x", { x: minPos.x - 0.01, y, z });
                drawFace("x", { x: maxPos.x + 1.01, y, z });
            }
        }
        for (let z = minPos.z; z <= maxPos.z; z += step) {
            for (let x = minPos.x; x <= maxPos.x; x += step) {
                drawFace("y", { x, y: minPos.y - 1.01, z });
                drawFace("y", { x, y: maxPos.y + 0.01, z });
            }
        }
    }
}, 4);
