import { getRejectedCondition, applySelectedId } from "./common_functions"
import RepeatLastCommands from "./main"
import { getModalCmdVars } from "./utils"


export function onHKTrigger(plugin: RepeatLastCommands, id: string) {// after shortcut
    const { modal } = getModalCmdVars(plugin)
    if (!modal.win && !getRejectedCondition(id)) {
        applySelectedId(id!, plugin)
    }
}


