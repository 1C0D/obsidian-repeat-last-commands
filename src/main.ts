import { Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { LastCommandsModal, getCommandName, onCommandTrigger } from './last-command';

interface RLCSettings {
	maxLastCmds: number;
	notify: boolean
}

const DEFAULT_SETTINGS: RLCSettings = {
	maxLastCmds: 4,
	notify: true
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
				if (this.lastCommand) {
					if (this.settings.notify) {
						new Notice(`Repeated: ${getCommandName(this.lastCommand)}`)
					};
					this.app.commands.executeCommandById(this.lastCommand)
				}
				else new Notice("No last command")
			},
		});

		this.addCommand({
			id: "repeat-commands",
			name: "Repeat commands",
			callback: async () => {
				if (this.lastCommands.length) new LastCommandsModal(this).open()
				else new Notice("No last command")
			},
		});

		this.addCommand({
			id: "get-last-command",
			name: "Copy last command id in clipbooard",
			callback: async () => {
				if (this.lastCommand) {
					navigator.clipboard.writeText(this.lastCommand).then(text => {
						new Notice("Command id copied in clipboard")
					}).catch(err => { console.error(err) });
				} else new Notice("No last command")
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
