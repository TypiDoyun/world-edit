export const sendMessage = (player, message, color = "5") => {
    player.sendMessage(` §${color}> §f${message}`);
};
