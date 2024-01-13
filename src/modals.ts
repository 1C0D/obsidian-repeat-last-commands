import { Plugin, SuggestModal } from "obsidian";
import RepeatLastCommands from "./main";
import { getCommandName } from "./utils";


type LastCommand = [string, string][]

export class LastCommandsModal extends SuggestModal<LastCommand> {
    constructor(public plugin: RepeatLastCommands) {
        super(plugin.app);
        this.plugin = plugin;
    }

    getSuggestions(query: string): LastCommand[] {
        const lastCommandsArr = this.plugin.lastCommands.map(id => [id, getCommandName(id)]).reverse();
        return lastCommandsArr.filter(cmd =>
            cmd[1].toLowerCase().includes(query.toLowerCase())
        );
    }

    renderSuggestion(cmd: LastCommand, el: HTMLElement) {
        el.createEl("div", { text: `${cmd[1]}` });
        el.createEl("small", { text: `${cmd[0]}` });
    }

    onChooseSuggestion(cmd: LastCommand, evt: MouseEvent | KeyboardEvent) {
        this.plugin.app.commands.executeCommandById(`${cmd[0]}`)
    }
}