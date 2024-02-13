import { App, Modal, Scope, Setting, SuggestModal, TextComponent } from "obsidian";
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
        let lastCommandsArr = this.plugin.lastCommands.map(id => [id, getCommandName(id)]).reverse();
        // console.log("this.lastCommands", this.lastCommands)
        if (this.plugin.settings.includeCmdPaletteOPen) {
            lastCommandsArr = [...lastCommandsArr, ["command-palette:open", "Open Command Palette"]]
        }
        return lastCommandsArr.filter(cmd =>
            cmd[1].toLowerCase().includes(query.toLowerCase())
        );
    }

    renderSuggestion(cmd: LastCommand, el: HTMLElement) {
        el.createEl("div", { text: `${cmd[1]}` });
        if(this.plugin.settings.showCmdId)
        el.createEl("div", { text: `${cmd[0]}`, cls: "id-suggest" });
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
        this.scope = new Scope(this.scope);
        this.scope.register([], "Enter", (evt, ctx) => {
            this.close();
            this.onSubmit(this.result);
        });
        if (this.width) {
            this.modalEl.style.width = `${this.width}px`;
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        const { chooser } = getConditions(this.plugin)
        let name = chooser.values[this.selectedItem].item.name
        name = name.startsWith("*") ? name.substring(1) : name
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