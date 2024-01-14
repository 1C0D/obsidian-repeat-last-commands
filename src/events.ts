import { Console } from "./Console"
import {  getBackSelection, getConditions, getModalCmdVars } from "./cmd-utils"
import RepeatLastCommands from "./main"
import { aliasModal } from "./modals"

async function addAlias(plugin: RepeatLastCommands, result: string, selectedItem: number) {
    const { values, aliases, chooser } = getConditions(plugin)
    const { item } = values[selectedItem]
    const selectedId = item.id
    const value = result?.trim()??""
    const { commands } = this.app.commands
    const commandName = commands[selectedId].name
    let text;
    // {aliasName} suggestion name
    const existingAlias = commandName.match(/{(.*)}/);
    if (existingAlias) {
        // Console.log("existingAlias", existingAlias)
        const existingValue = existingAlias[1];
        // Console.log("existingValue", existingValue)
        if (value === "") {
            text = `${commandName.replace(`{${existingValue}}`, "")}`.trim()
            delete aliases[selectedId];
        }
        else {
            text = `${commandName.replace(`{${existingValue}}`, `{${value}}`)}`.trim();
            aliases[selectedId] = { name: text }
        }
    }
    // suggestion name with : or just suggestion name → create alias
    else {
        const parts = commandName.split(": ")
        if (parts.length > 1) {
            // Console.log("has : & no {")
            text = `${parts[0]}: {${value}} ${parts[1]}`.trim()
            aliases[selectedId] = { name: text }
        } else {
            // Console.log("no : & no {")
            const prefix = value ? `{${value}}` : ""
            text = `${commandName} ${prefix}`.trim()
            value ? aliases[selectedId] = { name: text }
                : delete aliases[selectedId];
        }
    }
    chooser.values[selectedItem].item.name = text

    const { modal, instance, cmdPalette } = getModalCmdVars(plugin)
    if (!plugin.wasStared) {
        const name = chooser.values[selectedItem].item.name
        chooser.values[selectedItem].item.name = name.substring(1)
        plugin.lastCommands.remove(selectedId)
        plugin.lastCommand = null
    }
    plugin.wasStared = false
    await plugin.saveSettings();
    // await instance.saveSettings(cmdPalette) // save so the rendering is up to date    
    await modal.updateSuggestions()
}


export function altEvent(e: KeyboardEvent, plugin: RepeatLastCommands, selectedItem: number, chooser: any) {
    const name = chooser.values[selectedItem].item.name
    if (name.startsWith("*")) plugin.wasStared = true
    new aliasModal(plugin.app, plugin, selectedItem, async(result) => {
        await addAlias(plugin, result, selectedItem)
        getBackSelection(chooser, selectedItem)
    }, 300).open()
}