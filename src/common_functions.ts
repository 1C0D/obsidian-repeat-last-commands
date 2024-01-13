import RepeatLastCommands from "./main"

export function getRejectedCondition(id: string) {
    return (
        id === "repeat-last-commands:repeat-command" ||
        id === "repeat-last-commands:repeat-commands" ||
        id === "repeat-last-commands:get-last-command"
    )
}

// !! improve this if command already in
export function applySelectedId(id: string, plugin: RepeatLastCommands) {
    // command
    console.log("id", id)
    console.log("plugin.lastCommand", plugin.lastCommand)
    plugin.lastCommand = id
    console.log("plugin.lastCommand", plugin.lastCommand)
    // commands
    const maxEntries = plugin.settings.maxLastCmds;
    if (plugin.lastCommands.length > maxEntries) {
        plugin.lastCommands.shift();
    }
    plugin.lastCommands.push(id)
    plugin.lastCommands = [...new Set(plugin.lastCommands)];
    plugin.saveSettings()
}
