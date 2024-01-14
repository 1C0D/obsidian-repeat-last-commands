import RepeatLastCommands from "./main"

export function getConditions(plugin: RepeatLastCommands) {
    const { modal } = getModalCmdVars(plugin)
    const chooser = modal.chooser
    // Console.debug("chooser", chooser) // important to see structure and add icons? status bar
    const values = chooser.values
    const { aliases } = plugin.settings
    return { values, aliases, chooser }
}

export function getModalCmdVars(plugin: RepeatLastCommands) {
    const cmdPalette = getCmdPalette(plugin)
    const instance = cmdPalette.instance
    const modal = instance.modal
    return { modal, instance, cmdPalette }
}

export function getCmdPalette(plugin: RepeatLastCommands) {
    return plugin.app.internalPlugins.getPluginById("command-palette")
}

export function createInput(el: HTMLElement | null, currentValue: string) {
    if (el) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "choose an alias";
        input.value = currentValue;
        el.replaceWith(input);
        input.focus();
        selectValue(input);
        return input;
    } else {
        return undefined;
    }
}

export const selectValue = (input: HTMLInputElement | null) => {
    input?.setSelectionRange(0, input?.value.length);
};

export function aliasify(values: any, aliases: any) {
    values.map(async (value: any) => {
        if (value.item.id in aliases) {
            value.item.name = aliases[value.item.id].name
        }
    })
}

export function getBackSelection(chooser: any, selectedItem: number) {
    for (let i = 1; i <= selectedItem; i++) {
    try {
        if (selectedItem)
                chooser.moveDown(1)
        } catch (err) {
            const dd = "I don't care this error, job is done"
        }
    }

    // if (selectedItem === 0) chooser.selectedItem = chooser.values.length - 1
    // else chooser.selectedItem = selectedItem - 1
}