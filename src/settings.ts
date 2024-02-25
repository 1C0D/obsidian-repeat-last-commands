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

        new Setting(El)
            .setName("repeat last command: notify last command")
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
            .setName("repeat last commands: number max of commands to show")
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
            .setName("repeat last command(s): if no last command(s), then open command palette instead")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.notify)
                    .onChange(async (value) => {
                        this.plugin.settings.ifNoCmdOpenCmdPalette = value
                        await this.plugin.saveSettings();
                    })
            })

        new Setting(El)
            .setName('repeat last command(s): add "open command palette" as last command')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.notify)
                    .onChange(async (value) => {
                        this.plugin.settings.includeCmdPaletteOPen = value
                        await this.plugin.saveSettings();
                    })
            })

        new Setting(El)
            .setName("repeat last command(s): show command id (2nd line)")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.notify)
                    .onChange(async (value) => {
                        this.plugin.settings.showCmdId = value
                        await this.plugin.saveSettings();
                    })
            })

        new Setting(El)
            .setName("Add last command(s) exeptions IDs (seperated by new line)")
            .setDesc("ex: 'repeat-last-commands:repeat-command' or just 'repeat-last-commands' → all commands from this plugin. tips: use 'Copy last command id in clipbooard'to get last command id")
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
            .setDesc("depending on the number of last commands")
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
