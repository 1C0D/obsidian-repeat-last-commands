import { PluginSettingTab, Setting } from "obsidian";
import RepeatLastCommands from "./main";

export class RLCSettingTab extends PluginSettingTab {
    constructor(public plugin: RepeatLastCommands) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl: El } = this;
        El.empty();

        new Setting(El)
            .setName("repeat last commands: number max of commands to show")
            .addSlider((slider) => {
                slider
                    .setLimits(2, 12, 1)
                    .setValue(this.plugin.settings.maxLastCmds)
                    .onChange(async (value) => {
                        this.plugin.settings.maxLastCmds = value;
                        await this.plugin.saveSettings();
                    });
            })
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
    }
}
