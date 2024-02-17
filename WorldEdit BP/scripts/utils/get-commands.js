import { commands } from "../commands/index";
import Help from "../commands/help";
export const getCommands = () => {
    return [...commands, Help].sort((a, b) => a.name.localeCompare(b.name));
};
