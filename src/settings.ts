import { PluginSettingTab, Setting } from "obsidian";
import RepeatLastCommands from "./main";
import { getCommandName, getCommandIds } from "./cmd-utils";

export class RLCSettingTab extends PluginSettingTab {
    constructor(public plugin: RepeatLastCommands) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl: El } = this;
        El.empty();

        El.createEl("h3", { text: "Repeat last command" })

        new Setting(El)
            .setName("notify last command")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.notify)
                    .onChange(async (value) => {
                        this.plugin.settings.notify = value
                        await this.plugin.saveSettings();
                    })
            })

        El.createEl("h3", { text: "Repeat last commands" })

        new Setting(El)
            .setName("Number max of commands to show")
            .addSlider((slider) => {
                slider
                    .setLimits(2, 12, 1)
                    .setValue((this.plugin.settings.maxLastCmds))
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.maxLastCmds = value;
                        await this.plugin.saveSettings();
                    });
            })

        new Setting(El)
            .setName("If no last command(s), then open command palette instead")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.ifNoCmdOpenCmdPalette)
                    .onChange(async (value) => {
                        this.plugin.settings.ifNoCmdOpenCmdPalette = value
                        await this.plugin.saveSettings();
                    })
            })

        new Setting(El)
            .setName("Show command id (2nd line)")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.showCmdId)
                    .onChange(async (value) => {
                        this.plugin.settings.showCmdId = value
                        await this.plugin.saveSettings();
                    })
            })

        new Setting(El)
            .setName('Add "open command palette" as last command')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.includeCmdPaletteOPen)
                    .onChange(async (value) => {
                        this.plugin.settings.includeCmdPaletteOPen = value
                        await this.plugin.saveSettings();
                    })
            })

        const fragment = new DocumentFragment();
        fragment.createDiv({}, div => {
            div.innerHTML = `ex: 'repeat-last-commands:repeat-command'<br> 
        or 'repeat-last-commands' → all commands from this plugin.<br>
        Use 'Copy last command id in clipbooard', in command palette, to get last command id`
        });

        new Setting(El)
            .setName("Add last command(s) exeptions IDs (separated by new line)")
                .setDesc(fragment)
            .addTextArea((text) => {
                text
                    .setValue(this.plugin.settings.userExcludedIDs.join("\n"))
                    .onChange(async (value) => {
                        this.plugin.settings.userExcludedIDs = value.split("\n")
                        await this.plugin.saveSettings();
                    })
            })

        El.createEl("h3", { text: "Command palette" })

        new Setting(El)
            .setName("Recently used commands at top of command palette")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.sort)
                    .onChange(async (value) => {
                        this.plugin.settings.sort = value
                        await this.plugin.saveSettings();
                    })
            })

        const excluded = this.plugin.settings.excludeCommands
        let cmdNames: string[] = []
        for (const id of excluded) {
            cmdNames.push(getCommandName(id))
        }
        new Setting(El)
            .setName("Excluded commands from command palette")
            .addTextArea((text) => {
                text
                    .setValue(cmdNames.join("\n"))
                text.inputEl.onblur = async () => {
                    const textArray = text.getValue() ? text.getValue().trim().split("\n") : []
                    const ids = getCommandIds(textArray)
                    this.plugin.settings.excludeCommands = ids
                    await this.plugin.saveSettings();
                }
                text.inputEl.setAttr("rows", 4)
                text.inputEl.setAttr("cols", 40)
            })
    }
}
