import { around } from "monkey-around";
import { Command } from "obsidian";
import RepeatLastCommands from "./main";
import { altEvent } from "./events";
import { aliasify, getConditions } from "./cmd-utils";
import { Console } from "./Console";

function addCPListeners(plugin: RepeatLastCommands) {//command palette
    addClickListener(plugin)
    addKeyboardListener(plugin)
}

function onHKTrigger(plugin: RepeatLastCommands, id: string) {// after shortcut
    const { modal } = getModalCmdVars(plugin)
    if (!modal.win && !getRejectedCondition(id)) {
        applySelectedId(id!, plugin)
    }
}

export function onCommandTrigger(plugin: RepeatLastCommands) {//notice we must pass plugin to use it in cb
    const uninstallCommand = around(this.app.commands, {
        executeCommand(originalMethod) {
            return function (...args: Command[]) {
                if (args[0].id === "command-palette:open") { addCPListeners(plugin) }
                else { onHKTrigger(plugin, args[0].id) }
                const result =
                    originalMethod && originalMethod.apply(this, args);
                return result;
            };
        },
    });
    return uninstallCommand;
}

function getRejectedCondition(id: string) {
    return (
        id === "repeat-last-commands:repeat-command" ||
        id === "repeat-last-commands:repeat-commands" ||
        id === "repeat-last-commands:get-last-command"
    )
}

function applySelectedId(id: string, plugin: RepeatLastCommands) {
    // command
    const { lastCommands, settings } = plugin
    plugin.lastCommand = id

    // commands
    const maxEntries = settings.maxLastCmds;
    if (lastCommands.length > maxEntries) {
        lastCommands.shift();
    }
    lastCommands.push(id)
    plugin.lastCommands = [...new Set(lastCommands)];
    plugin.saveSettings()
}


export function registerCPCmd(e: MouseEvent | KeyboardEvent, plugin: RepeatLastCommands) {
    const { modal, instance, pluginCommand } = getModalCmdVars(plugin)
    const { values, aliases, chooser } = getConditions(plugin)
    const settings = plugin.settings
    // Console.log("aliases", aliases)
    const selectedItem = chooser.selectedItem
    Console.log("selectedItem", selectedItem)

    // suggestion values matching aliases
    if (Object.keys(aliases).length || settings.sort) {
        setTimeout(async () => {
            if (Object.keys(aliases).length) {
                aliasify(values, aliases)
            }
            if (plugin.lastCommands.length) {
                for (const value of values) {
                    if (plugin.lastCommands.includes(value.item.id)) {value.item.name.startsWith("*") ? null :
                        value.item.name = "*" + value.item.name
                }else{
                    if(value.item.name.startsWith("*")) value.item.name = value.item.name.substring(1)
                }
            }
            for (const id of plugin.lastCommands) {
                if (values.find((value: any) => value.item.id === id)) {
                    values.item.name = "*" + values.item.name
                }
                values.push({ item: { id, name: id } })
            }
        }
            instance.saveSettings(pluginCommand)
            await modal.updateSuggestions()
        }, 200);
}

if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== "Tab" && e.key !== "Alt") return


if (e instanceof KeyboardEvent && e.key === "Alt") {
    altEvent(e as KeyboardEvent, plugin, selectedItem)
}

const selectedId = chooser.values[selectedItem]?.item.id
if (e instanceof KeyboardEvent && e.key === "Tab") {
    if (!modal.win) return
    const pinned = instance.options.pinned
    if (pinned.includes(selectedId)) {
        pinned.remove(selectedId)
    } else {
        instance.options.pinned.push(selectedId)
    }
    instance.saveSettings(pluginCommand)
    modal.updateSuggestions()
    return
}

const rejectedIds = getRejectedCondition(selectedId)
if (rejectedIds) return
applySelectedId(selectedId, plugin)
}


// listeners
function addClickListener(plugin: RepeatLastCommands) {
    const { modal } = getModalCmdVars(plugin)
    const resultContainerEl = modal.resultContainerEl
    resultContainerEl.addEventListener("click", (e: MouseEvent) => registerCPCmd(e, plugin));
}

function addKeyboardListener(plugin: RepeatLastCommands) {
    const { modal } = getModalCmdVars(plugin)
    const keyupEventListener = (e: KeyboardEvent) => registerCPCmd(e, plugin);
    document.addEventListener("keyup", keyupEventListener)

    // to erase the document.listener
    const closeModal = plugin.app.internalPlugins.getPluginById("command-palette").instance.modal.onClose;
    plugin.app.internalPlugins.getPluginById("command-palette").instance.modal.onClose = () => {
        setTimeout(() => {
            document.removeEventListener("keyup", keyupEventListener)
        }, 400);// without timer enter is not working when selecting an item before
        closeModal.apply(modal);
    };
}

function getModalCmdVars(plugin: RepeatLastCommands) {
    const pluginCommand = plugin.app.internalPlugins.getPluginById("command-palette")
    const instance = pluginCommand.instance
    const modal = instance.modal
    return { modal, instance, pluginCommand }
}

export function getCommandName(id: string) {
    for (const key in this.app.commands.commands) {
        const command = this.app.commands.commands[key];
        if (command.id === id) {
            return command.name;
        }
    }
    return null;
}