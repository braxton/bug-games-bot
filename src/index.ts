import { Client, Collection } from "discord.js";
import klaw from "klaw";
import path from "path";
import fetch from "node-fetch";

import DatabaseHandler from "./helpers/database";

const commandsPath = path.join(__dirname, "commands");
const eventsPath = path.resolve(__dirname, "events");

class JiraBot extends Client {
  public constructor() {
    super();

    this.commands = new Collection();
    this.database = new DatabaseHandler();
    this.events = new Collection();

    this._loadCommands();
    this._loadEvents();

    this.login(process.env.DISCORD_TOKEN);
  }

  public async hastebin(data: any): Promise<string | boolean> {
    const body = await fetch("https://haste.cheezewerks.com/documents", {
      method: "POST",
      body: data
    }).then(r => r.json())
      .catch(() => { return false; });
    
    if (!body || !body.key) return false;
    return `https://haste.cheezewerks.com/${body.key}`;
  }

  private _loadCommands(): void {
    klaw(commandsPath).on("data", async item => {
      const file = path.parse(item.path);
      if (!file.ext || file.ext !== ".js") return;

      let command = (await import(`${file.dir}/${file.base}`)).default;
      command = new command();

      this.commands.set(command.name, command);
    });
  }

  private _loadEvents(): void {
    klaw(eventsPath).on("data", async item => {
      const file = path.parse(item.path);
      if (!file.ext || file.ext !== ".js") return;

      let event = (await import(`${file.dir}/${file.base}`)).default;
      event = new event(this);

      this.events.set(event.name, event);
      this.on(event.name, (...args) => event.execute(...args));
      console.log(`Event Loaded: ${event.name}`);
    });
  }
}

new JiraBot();

process
  .on("uncaughtException", err => console.error(err.stack))
  .on("unhandledRejection", err => console.error(err));