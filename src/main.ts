import { Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { LastCommandsModal, onCommandTrigger } from './last-command';

interface RLCSettings {
	maxLastCmds: number
}

const DEFAULT_SETTINGS: RLCSettings = {
	maxLastCmds: 4
}

export default class RepeatLastCommands extends Plugin {
	settings: RLCSettings;
	lastCommand: string | null
	lastCommands: string[] = []

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new RLCSettingTab(this));


		this.register(onCommandTrigger(this))

		this.addCommand({
			id: "repeat-command",
			name: "Repeat last command",
			callback: async () => {
				if (this.lastCommand) (this.app as any).commands.executeCommandById(this.lastCommand)
				else new Notice("No last command")
			},
		});

		this.addCommand({
			id: "repeat-commands",
			name: "Repeat last commands",
			callback: async () => {
				if (this.lastCommands.length) new LastCommandsModal(this).open()
				else new Notice("No last command")
			},
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class RLCSettingTab extends PluginSettingTab {
	constructor(public plugin: RepeatLastCommands) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl: El } = this;
		El.empty();
		El.createEl("h2", { text: "Repeat Last Commands" });
		const setting = new Setting(El)
		setting
			.addSlider((slider) => {
				slider
					.setLimits(2, 12, 1)
					.setValue(this.plugin.settings.maxLastCmds)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxLastCmds = value;
						await this.plugin.saveSettings();
					});
			})
	}
}
