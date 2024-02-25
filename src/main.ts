import { Command, Notice, Plugin } from 'obsidian';
import { around } from 'monkey-around';
import { onCommandTrigger } from './palette';
import { RLCSettingTab } from './settings';
import { RLCSettings } from './global';
import { DEFAULT_SETTINGS } from './variables';
import { LastCommandsModal } from './modals';
import { Console } from './Console';
import { getCommandName } from './cmd-utils';

export default class RepeatLastCommands extends Plugin {
	settings: RLCSettings;
	lastCommand: string | null
	lastCommands: string[] = []
	infoDiv: HTMLDivElement | null
	wasStared: boolean

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new RLCSettingTab(this));

		const {settings} = this
		this.register(around(this.app.commands.constructor.prototype, {
			listCommands(old) {
				return function (...args: any[]) {
					const commands: Command[] = old.call(this, ...args);
					return commands.filter((command) => !settings.excludeCommands.includes(command.id));
				}
			}
		}));

		this.register(onCommandTrigger(this))

		const text = this.settings.ifNoCmdOpenCmdPalette ? "No last command.\n→ command palette" : "No last command"

		this.addCommand({
			id: "repeat-command",
			name: "Repeat last command",
			callback: async () => {
				if (this.lastCommand) {
					if (this.settings.notify) {
						new Notice(`Repeated: ${getCommandName(this.lastCommand)}`)
					};
					Console.log("this.lastCommand", this.lastCommand)
					this.app.commands.executeCommandById(this.lastCommand)
				}
				else {
					new Notice(text, 2500)
					if (this.settings.ifNoCmdOpenCmdPalette)
					this.app.commands.executeCommandById("command-palette:open") 
				}
			},
		});

		this.addCommand({
			id: "repeat-commands",
			name: "Repeat commands",
			callback: async () => {
				if (this.lastCommands.length){ 
					new LastCommandsModal(this).open()}
				else {
					new Notice(text,2500)
					if (this.settings.ifNoCmdOpenCmdPalette)
					this.app.commands.executeCommandById("command-palette:open") 
				}
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

