import { Client, GuildMember, Message } from "discord.js";

import { IBotCommand, IBotEvent, PermissionLevel } from "../typings/index";

export default class implements IBotEvent {
  public readonly client: Client;
  public readonly name: string;
  
  public constructor(client: Client) {
    this.client = client;
    this.name = "message";
  }

  public execute(ctx: Message): void {
    if (ctx.author.bot) return;
    if (ctx.channel.type !== "text") return;

    if (!ctx.content.startsWith(process.env.DISCORD_PREFIX)) return;
    const content = ctx.content.slice(process.env.DISCORD_PREFIX.length);

    const command = this.fetchCommand(content.split(" ")[0]);
    if (!command) return;

    ctx.permLevel = this.resolvePermission(ctx.member);
    if (command.ltu > ctx.permLevel) return;

    command.execute(ctx);
  }

  public fetchCommand(name: string): IBotCommand | null {
    if (this.client.commands.has(name)) return this.client.commands.get(name);
    for (const command of this.client.commands.values())
      if (command.aliases.includes(name)) return command;
    return;
  }

  public resolvePermission(member: GuildMember): PermissionLevel {
    if (member.user.id === process.env.OWNER) return PermissionLevel.BotDev;

    return PermissionLevel.User;
  }
}