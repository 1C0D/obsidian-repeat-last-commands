import RepeatLastCommands from "./main";

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

export function getCommandName(id: string) {
    for (const key in this.app.commands.commands) {
        const command = this.app.commands.commands[key];
        if (command.id === id) {
            return command.name;
        }
    }
    return null;
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

