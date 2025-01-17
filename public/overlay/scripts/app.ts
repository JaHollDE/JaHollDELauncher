import SocketManager from "./socket";
import { ExpressManager } from "./express";
import { Window } from "./window";
import { initIPCEvents } from "./utils/ipc-events";
import { ConfigManager } from "./manager/config-manager";
import { BrowserWindow } from "electron";
import LogManager from "./manager/log-manager";
import { TrayManager } from "./tray";

export default class JaHollDEApplication {
    public socket!: SocketManager;
    public express!: ExpressManager;
    //public window!: Window;
    public config!: ConfigManager;
    public mainWindow!: BrowserWindow;
    public log!: LogManager;
    public tray!: TrayManager;

    public async init(mainWindow: BrowserWindow) {
        this.config = new ConfigManager(this);
        this.socket = new SocketManager(this);

        this.express = new ExpressManager(this);
        this.log = new LogManager(this);
        //this.window = new Window(this);

        this.mainWindow = mainWindow;

        this.tray = new TrayManager(this);

        initIPCEvents(this);


        await this.socket.init();
        console.log("--- JaHollDE Electron-Setup finished ---")
    }

    public getURL(withPrefix = true) {
        return (withPrefix ? "https://" : "") + (this.config.config.isDevInstance ? "https://devweb.jaholl.de" : "https://interface.jaholl.de");
    }
}
