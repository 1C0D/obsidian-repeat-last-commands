import { App, Modal, Setting, SuggestModal, TextComponent } from "obsidian";
import { getCommandName } from "./last-command";
import RepeatLastCommands from "./main";
import { LastCommand } from "./global";
import { getConditions } from "./cmd-utils";

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



export class aliasModal extends Modal {
    result: string;
    constructor(app: App, public plugin: RepeatLastCommands, 
        public selectedItem: number, public onSubmit: (result: string) => void, public width?: number) {
        super(app);
        if (this.width) {
            this.modalEl.style.width = `${this.width}px`;
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        const { chooser } = getConditions(this.plugin)
        const name = chooser.values[this.selectedItem].item.name
        this.titleEl.setText(`Define an alias`); //
        contentEl.setText(`for: "${name}"`); //
        const input = new TextComponent(contentEl)
            .setPlaceholder('alias or nothing to delete previous alias')            
            .onChange(async (value) => {
                this.result = value;
            })
            const eL = input.inputEl
            eL.addClass('alias-input')
            eL.size = 35
            

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Submit")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(this.result);
                    }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}