import 'obsidian'

interface RLCSettings {
    maxLastCmds: number;
    notify: boolean;
    aliases: Record<string, Record<string, string>>;
    sort: boolean;
    userExcludedIDs: string[];
    ifNoCmdOpenCmdPalette: boolean;
    includeCmdPaletteOPen: boolean;
    showCmdId: boolean;
    excludeCommands: string[]
}

type LastCommand = [string, string][]


declare module 'obsidian' {
    interface App {
        commands: Commands;
        internalPlugins: InternalPlugins
    }

    interface InternalPlugins {
        getPluginById: (id: InternalPlugin) => Plugin;
    }

    interface Plugin {
        instance: any;
    }

    interface Commands {
        commands: Record<string, Command>;
        executeCommandById: (commandId: string) => boolean;
    }
}

type InternalPlugin = "audio-recorder" |
    "backlink" |
    "bookmarks" |
    "canvas" |
    "command-palette" |
    "daily-notes" |
    "editor-status" |
    "file-explorer" |
    "file-recovery" |
    "global-search" |
    "graph" |
    "markdown-importer" |
    "note-composer" |
    "outgoing-link" |
    "outline" |
    "page-preview" |
    "properties" |
    "publish" |
    "random-note" |
    "slash-command" |
    "slides" |
    "starred" |
    "switcher" |
    "sync" |
    "tag-pane" |
    "templates" |
    "word-count" |
    "workspaces" |
    "zk-prefixer"
