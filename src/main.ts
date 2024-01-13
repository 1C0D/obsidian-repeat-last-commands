import { Notice, Plugin } from 'obsidian';
import { LastCommandsModal, getCommandName, onCommandTrigger } from './last-command';
import { RLCSettingTab } from './settings';
import { RLCSettings } from './global';
import { DEFAULT_SETTINGS } from './variables';

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

