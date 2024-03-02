import { App, Modal, Scope, Setting, SuggestModal, TextComponent } from "obsidian";
import RepeatLastCommands from "./main";
import { LastCommand } from "./global";
import { getCommandIds, getCommandName, getConditions } from "./cmd-utils";

export class LastCommandsModal extends SuggestModal<LastCommand> {
    constructor(public plugin: RepeatLastCommands) {
        super(plugin.app);
        this.plugin = plugin;
    }

    getSuggestions(query: string): LastCommand[] {
        let lastCommandsArr = this.plugin.lastCommands.map(id => [id, getCommandName(id)]).reverse();
        if (this.plugin.settings.includeCmdPaletteOPen) {
            lastCommandsArr = [...lastCommandsArr, ["command-palette:open", "Open Command Palette"]]
        }
        return lastCommandsArr.filter(cmd =>
            cmd[1].toLowerCase().includes(query.toLowerCase())
        );
    }

    renderSuggestion(cmd: LastCommand, el: HTMLElement) {
        if (cmd[1].includes(":")) {
            const [name, command] = cmd[1].toString().split(":");
            el.createEl("div", {
                cls: "cmd-suggest",
            }, (cont) => {
                cont.createEl("span", { text: `${name}:`, cls: "cmd-suggest-name" });
                cont.createEl("span", { text: `${command}`, cls: "cmd-suggest-cmd" });
            });
        } else {
            el.createEl("div", { text: `${cmd[1]}`, cls: "cmd-alone" });
        }

        if (this.plugin.settings.showCmdId)
            el.createEl("div", { text: `${cmd[0]}`, cls: "id-suggest" });
    }

    onChooseSuggestion(cmd: LastCommand, evt: MouseEvent | KeyboardEvent) {
        this.plugin.app.commands.executeCommandById(`${cmd[0]}`)
    }
}



export class AliasModal extends Modal {
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
            .setPlaceholder('enter nothing to delete previous alias')
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

export class ShowAgainCmds extends Modal {
    constructor(app: App, public plugin: RepeatLastCommands,
        public modal: any, public width?: number) {
        super(app);
        if (this.width) {
            this.modalEl.style.width = `${this.width}px`;
        }
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        const excluded = this.plugin.settings.excludeCommands
        let cmdNames: string[] = []
        for (const id of excluded) {
            cmdNames.push(getCommandName(id))
        }
        new Setting(contentEl)
            .setName("Excluded commands from command palette")
            .addTextArea((text) => {
                text
                    .setValue(cmdNames.join("\n"))
                text.inputEl.onblur = async () => {
                    const textArray = text.getValue() ? text.getValue().trim().split("\n") : []
                    const ids = getCommandIds(textArray)
                    this.plugin.settings.excludeCommands = ids
                    await this.plugin.saveSettings();
                    this.close()
                    this.modal.close()
                    this.app.commands.executeCommandById("command-palette:open")
                }
                text.inputEl.setAttr("rows", 4)
                text.inputEl.setAttr("cols", 40)
            })
    }
}