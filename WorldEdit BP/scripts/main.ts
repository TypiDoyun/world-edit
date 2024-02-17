import { DimensionLocation, Player, system, world } from "@minecraft/server";
import { PosManager } from "./classes/pos-manager";
import { sendMessage } from "./utils/send-message";
import { positionEquals } from "./utils/position-equals";
import { parseArguments } from "./utils/parse-arguments";
import { Command } from "./classes/command";
import { getCommands } from "./utils/get-commands";
import { isHost } from "./utils/is-host";

const interfaceItem = "minecraft:wooden_axe";
const moveItem = "minecraft:feather";

world.beforeEvents.playerBreakBlock.subscribe(eventData => {
    const { player, itemStack, block: { location: { x, y, z } } } = eventData;

    if (!itemStack) return;
    if (itemStack.typeId !== interfaceItem) return;
    if (!player.isOp()) return;

    eventData.cancel = true;

    const posState = PosManager.getPosState(player);
    const dimension = player.dimension;
    const newPos = { dimension, x, y, z };

    posState.setFirstPos(newPos);

    sendMessage(player, `The First position set to    §5|§f { ${x}, ${y}, ${z} }`);

    if (!posState.isValid) sendMessage(player, `Warning! §5|§f The first position set in another dimension `);
});

type Delay = {
    delay: number,
    position: DimensionLocation
}

const useDelay = new Map<Player, Delay>();

world.beforeEvents.itemUseOn.subscribe(eventData => {
    const { source: player, itemStack, block: { location: { x, y, z } } } = eventData;

    if (!itemStack) return;
    if (itemStack.typeId !== interfaceItem) return;
    if (!player.isOp()) return;
    
    const delay = useDelay.get(player);
    const dimension = player.dimension;
    const newPos = { dimension, x, y, z };

    if (delay && delay.delay !== 0 && positionEquals(delay.position, newPos)) return;

    useDelay.set(player, {
        delay: 10,
        position: newPos
    });

    eventData.cancel = true;

    const posState = PosManager.getPosState(player);

    posState.setSecondPos(newPos);

    sendMessage(player, `The second position set to §5|§f { ${x}, ${y}, ${z} }`);

    if (!posState.isValid) sendMessage(player, `Warning! §5|§f The second position set in another dimension `);
});

world.beforeEvents.itemUse.subscribe(eventData => {
    const { source: player, itemStack } = eventData;
    
    if (!itemStack) return;
    if (itemStack.typeId !== moveItem) return;
    if (!player.isOp()) return;

    eventData.cancel = true;

    const viewVector = player.getViewDirection();

    system.run(() => {
        player.applyKnockback(viewVector.x, viewVector.z, 10 * Math.cos(player.getRotation().x * Math.PI / 180), viewVector.y * 1.6);
    })
});

world.afterEvents.worldInitialize.subscribe(() => {
    const player = world.getAllPlayers()[0];

    world.setDynamicProperty("typidoyun:hostname", player.name);
});

world.beforeEvents.chatSend.subscribe(eventData => {
    const { sender, message } = eventData;

    if (!message.startsWith(Command.commandPrefix)) return;

    eventData.cancel = true;

    const [ commandName, ...rawArgs ] = message.substring(1).split(" ");
    const command = getCommands().find(item => item.name === commandName || item.aliases.includes(commandName));

    if (!command) return sendMessage(sender, `Unknown command: ${commandName}`, "c");
    if (command.permission === "AdminOnly" && !sender.isOp()) return sendMessage(sender, `Unknown command: ${commandName}`, "c");
    else if (command.permission === "HostOnly" && !isHost(sender)) return sendMessage(sender, `Unknown command: ${commandName}`, "c");

    const result = parseArguments(sender, command, rawArgs.join(" "));
    
    if (!result.isSuccess) return;

    command.onExecute(sender, result.arguments as []);
});

system.runInterval(() => {
    useDelay.forEach((delay, player) => {
        if (delay.delay <= 0) return;
        if (delay.delay - 2 < 0) return;

        delay.delay -= 2;
    });
}, 2);

// 위아래 60도
// 양옆 74도

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        if (!PosManager.hasPosState(player)) continue;

        const inventory = player.getComponent("inventory")!;
        const container = inventory.container!;
        
        const item = container.getItem(player.selectedSlot);
        
        if (!item) continue;
        if (item.typeId !== interfaceItem) continue;

        const posState = PosManager.getPosState(player);

        posState.visualize("line");
    }
}, 5);