import { Client, Message } from "discord.js";
import DatabaseHandler from "helpers/database";

export type ActivityType =
  "fishing" | "youtube" | "betrayal" | "poker"

export const enum PermissionLevel {
  User,
  BotDev
}

export interface IBotEvent {
  client: Client
  name: string
  execute(...args): void
}

export interface IBotCommand {
  name: string
  aliases: string[]
  ltu: PermissionLevel
  execute(message: Message): Promise<Message | void> | Message | void
}

export interface IActivitiesDBEntry {
  id: string
  code: string
  expiresAt: number
}

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, IBotCommand>
    database: DatabaseHandler
    events: Collection<string, IBotEvent>
  }

  export interface Message {
    permLevel: PermissionLevel
  }
}