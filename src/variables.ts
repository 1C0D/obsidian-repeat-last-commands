import { RLCSettings } from "./global";

export const DEFAULT_SETTINGS: RLCSettings = {
    maxLastCmds: 4,
    notify: true,
    aliases: {},
    sort: true,
    userExcludedIDs: [],
    ifNoCmdOpenCmdPalette: true,
    includeCmdPaletteOPen: true,
    showCmdId: true
}