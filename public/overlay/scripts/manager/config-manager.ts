import * as path from "path";
import * as fs from "fs";
import { app, ipcMain, ipcRenderer } from "electron";
import IpcMainEvent = Electron.IpcMainEvent;
import JaHollDEApplication from "../app";
import handleScale from "./config-key-handler/scale-handler";

const presetConfig = {
    url: "https://interface.jaholl.de",
    debug: false,
    showMainDevTools: false,
    showSettingsDevTools: false,
};
const p = path.resolve("../../developer.json");
let config: typeof presetConfig;
if (fs.existsSync(p)) {
    config = JSON.parse(fs.readFileSync(p).toString());
} else {
    config = presetConfig;
}
for (const key in presetConfig) {
    if (config[key] === undefined) config[key] = presetConfig[key];
}

const url = config.url;
const debug = config.debug;
const showMainDevTools = config.showMainDevTools;
const showSettingsDevTools = config.showSettingsDevTools;

export { url, debug, showMainDevTools, showSettingsDevTools };

interface Config {
    microphoneID: string;
    speakerID: string;
    microphoneVolume: number;
    speakerVolume: number;
    voiceThreshold: number;
    windowScaling: number;
    externalMicrophone: boolean;
    showHints: boolean;
    enableHardwareAcceleration: boolean;
    productive: boolean;
    assetsVersion: string;
    isDevInstance: boolean;
    instances: string[];
    devInstances: string[];
    agreedToCookies: boolean;
    showTaskbar: boolean;
}

const defaultConfig: Config = {
    microphoneID: "",
    speakerID: "",
    microphoneVolume: 1,
    speakerVolume: 1,
    voiceThreshold: -50,
    windowScaling: 1,
    externalMicrophone: false,
    showHints: true,
    enableHardwareAcceleration: false,
    productive: true,
    assetsVersion: "undefined",
    isDevInstance: false,
    instances: ["jahollde"],
    devInstances: [],
    agreedToCookies: false,
    showTaskbar: false
};

class ConfigManager {
    public static instance: ConfigManager;

    private handlers: {[key: string]: (application: JaHollDEApplication, newValue: any) => Promise<void>} = {
        windowScaling: handleScale
    }

    public config: Config;
    private path: string;

    constructor(private application: JaHollDEApplication) {
        ConfigManager.instance = this;
        const appData = app.getPath('userData');
        const newPath = path.join(appData, "jahollde_config.json");
        if (fs.existsSync(newPath)) {
            this.config = JSON.parse(fs.readFileSync(newPath).toString());
            for (const key of Object.keys(defaultConfig)) {
                if (this.config[key] === undefined)
                    this.config[key] = defaultConfig[key];
            }
        } else {
            this.config = defaultConfig;
        }

        this.path = newPath;
        this.save();

        ipcMain.handle("config-update", this.updateConfig.bind(this));
        ipcMain.handle("get-config", (event) => {
            for (const key of Object.keys(this.config)) {
                this.application.socket.getAllInstances().forEach(win => {
                    win.window?.getWindow().then(w => w.webContents.send(
                      "config-key-update",
                      key,
                      this.config[key]
                    ));
                });


            }
            //this.application.socketManager.sendUUIDUpdate();
            // disable mouse events on load
            //this.application.windowManager.disableMouseEvents();
        });
        ipcMain.handle("get-config-key", (event, key: string) => {
            return this.config[key];
        });
    }

    public async updateConfig(
        event: IpcMainEvent | undefined,
        key: string,
        value: any
    ): Promise<void> {
        this.config[key] = value;
        this.save();
        console.log("received config update: ", key, value);

        if (this.handlers[key] !== undefined) await this.handlers[key](this.application, value);

        this.application.socket.getAllInstances().forEach(win => {
            win.window?.getWindow().then(w => w.webContents.send(
              "config-key-update",
              key,
              this.config[key]
            ));
        });

        /*
        if (!this.application.windowManager?.getWindow()?.isDestroyed()) {

            if (key === "windowScaling") {
                this.application.windowManager
                    ?.getWindow()
                    .webContents.setZoomFactor(value);
            }
        }*/
    }

    public save() {
        fs.writeFileSync(this.path, JSON.stringify(this.config, undefined, 2));
    }
}

export { ConfigManager };
