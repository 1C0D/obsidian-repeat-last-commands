// régler enter cmd
// créer un modal pour éviter pb avec enter
// répétition de code/ enter ne marche pas pour cmds/
import { Console } from "./Console";
import { applySelectedId, getRejectedCondition } from "./common_functions";
import RepeatLastCommands from "./main";
import { createInput, getModalCmdVars } from "./utils";

// command palette
export async function addCPListeners(plugin: RepeatLastCommands) {
    let { values, aliases } = getConditions(plugin)
    const { lastCommands } = plugin
    // adding aliases or sorting by last commands (Not working)
    if (
        Object.keys(aliases).length 
        // || lastCommands.length
        ) {
        setTimeout(async () => {
            if (Object.keys(aliases).length) {
                aliasify(values, aliases)
            }
            // if (lastCommands.length) {
            //     values = sortValues(plugin, values, aliases)
            // }
            await modal.updateSuggestions()
        }, 450);
    }
    const { modal } = getModalCmdVars(plugin)
    const resultContainerEl = modal.resultContainerEl
    // click suggestion
    resultContainerEl.onclick = async (e: MouseEvent) => await registerCPCmd(e, plugin);  // ok 
    // confirm enter suggestion
    addKeyupEventListener(plugin) //enter tab alt
}

function addKeyupEventListener(plugin: RepeatLastCommands) {
    // add listener
    const keyupEventListener = async (e: KeyboardEvent) => await registerCPCmd(e, plugin);
    document.addEventListener("keyup", keyupEventListener)
    // remove listener
    const { modal, cmdPalette } = getModalCmdVars(plugin)
    const closeModal = cmdPalette.instance.modal.onClose;
    cmdPalette.instance.modal.onClose = () => {
        setTimeout(() => {
            document.removeEventListener("keyup", keyupEventListener)
        }, 100);
        closeModal.apply(modal);
    };
}

export async function registerCPCmd(e: MouseEvent | KeyboardEvent, plugin: RepeatLastCommands) {
    Console.log("enter we are here ?")
    const { values, aliases, chooser } = getConditions(plugin)
    // suggestion values matching aliases
    if (Object.keys(aliases).length) {
        aliasify(values, aliases)
    }

    // so input can be filled
    if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== "Tab" && e.key !== "Alt") return

    // alt to create alias on a suggestion
    if (e instanceof KeyboardEvent && e.key === "Alt") {
        altEvent(e as KeyboardEvent, plugin, chooser)
    }

    if (e instanceof KeyboardEvent && e.key === "Tab") {
        tabEvent(e as KeyboardEvent, plugin,)
    }
    console.log("ici")
    const selectedItem = chooser.selectedItem
    const { item } = chooser.values[selectedItem]
    const selectedId = item.id
    const rejectedIds = getRejectedCondition(selectedId)
    console.log("rejectedIds", rejectedIds)
    if (rejectedIds) return
    applySelectedId(selectedId, plugin)
}


function altEvent(e: KeyboardEvent, plugin: RepeatLastCommands, chooser: any) {
    const { modal, instance  ,cmdPalette     } = getModalCmdVars(plugin)
    const { aliases } = plugin.settings
    const container = chooser.containerEl
    const selectedItem = chooser.selectedItem
    const el = container.children[selectedItem]
    const { item } = chooser.values[selectedItem]
    const selectedId = item.id

    const input = createInput(el, "");
    if (input) {
        const addAlias = async () => {
            const value = input.value.trim()
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
                    text = `${commandName.replace(`{${existingValue}} `, "")}`
                    delete aliases[selectedId];
                }
                else {
                    text = `${commandName.replace(`{${existingValue}}`, `{${value}}`)}`;
                    aliases[selectedId] = { name: text }
                }
            }
            // suggestion name with : or just suggestion name → create alias
            else {
                const parts = commandName.split(": ")
                if (parts.length > 1) {
                    // Console.log("has : & no {")
                    text = `${parts[0]}: {${value}} ${parts[1]}`
                    aliases[selectedId] = { name: text }
                } else {
                    // Console.log("no : & no {")
                    const prefix = value ? `{${value}} ` : ""
                    text = `${prefix}${commandName}`
                    value ? aliases[selectedId] = { name: text }
                        : delete aliases[selectedId];
                }
            }
            chooser.values[selectedItem].item.name = text
            // commands[selectedId].name = text;
            await plugin.saveSettings();
            await instance.saveSettings(cmdPalette) // save so the rendering is up to date
            await modal.updateSuggestions()
        }

        // confirm input. Enter is a problem because can't stop propagation
        input.onkeydown = async (event) => {
            if (event.key === "Enter") {
                await addAlias();
            }
        };
        input.onblur =
            async (event) => await addAlias();
    }
    return
}


async function tabEvent(e: KeyboardEvent, plugin: RepeatLastCommands) {
    const { modal, instance, cmdPalette } = getModalCmdVars(plugin)
    const chooser = modal.chooser
    const selectedItem = chooser.selectedItem
    const { item } = chooser.values[selectedItem]
    const selectedId = item.id

    if (!modal.win) return
    const pinned = instance.options.pinned
    if (pinned.includes(selectedId)) {
        pinned.remove(selectedId)
    } else {
        instance.options.pinned.push(selectedId)
    }
    await instance.saveSettings(cmdPalette)
    await modal.updateSuggestions()
    return
}

function getConditions(plugin: RepeatLastCommands) {
    const { modal } = getModalCmdVars(plugin)
    const chooser = modal.chooser
    Console.debug("chooser", chooser) // important to see structure and add icons? status bar
    const values = chooser.values
    const { aliases } = plugin.settings
    return { values, aliases, chooser }
}

function sortValues(plugin: RepeatLastCommands, values: any[], aliases: any) {
    const { lastCommands } = plugin
    // console.log("lastCommands", lastCommands)
    console.log("values before", values.slice(0, 5))
    console.log("oui ya des cmd")
    let firstValues = [];
    let shortenValues = [];
    // console.log("lastCommands", lastCommands)
    for (const value of values.slice(0, 5)) {
        console.log("value.item?.id", value.item?.id)
        console.log("lastCommands", lastCommands)
        // if (value.item?.id in lastCommands) {
        let count = 1
        for (const cmd of lastCommands) {
            if (value.item?.id === cmd) {
                value.item.id = `_${value.item.id}`
                firstValues.push(value)
            } else {
                shortenValues.push(value)
            }
            count++
        }
    }
    console.log("firstValues", firstValues)
    console.log("shortenValues", shortenValues)
    values = [...firstValues, ...shortenValues]
    console.log("values after", values)
    return values
}

function aliasify(values: any, aliases: any) {
    values.map(async (value: any) => {
        if (value.item.id in aliases) {
            value.item.name = aliases[value.item.id].name
        }
    })
}
