import { Message } from "discord.js";

import { IBotCommand, PermissionLevel } from "../typings/index";

export default class implements IBotCommand {
  public readonly aliases: string[];
  public readonly ltu: PermissionLevel;
  public readonly name: string;
  
  public constructor() {
    this.name = "ping";
    this.ltu = PermissionLevel.User;
    this.aliases = [];
  }

  public execute(message: Message): void {
    message.channel.send("Pinging...")
      .then(m => m.edit(`Client Ping: ${m.createdTimestamp - message.createdTimestamp} | API Ping: ${message.client.ws.ping}`));
  }
}