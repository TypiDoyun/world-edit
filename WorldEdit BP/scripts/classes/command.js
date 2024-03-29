export class Command {
    static commandPrefix = "-";
    name;
    description;
    aliases;
    usage;
    permission;
    argumentTypes;
    onExecute;
    onHelp;
    constructor(command) {
        this.name = command.name;
        this.description = command.description;
        this.usage = command.usage;
        this.aliases = command.aliases;
        this.permission = command.permission;
        this.argumentTypes = command.argumentTypes;
        this.onExecute = command.onExecute;
        this.onHelp = command.onHelp;
    }
}
