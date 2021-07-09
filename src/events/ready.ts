import { Client } from "discord.js";
import { IActivitiesDBEntry, IBotEvent } from "typings";

export default class implements IBotEvent {
  public readonly client: Client;
  public readonly name: string;
  public readonly dbCleanLoop: NodeJS.Timeout;

  public constructor(client: Client) {
    this.client = client;
    this.name = "ready";

    this.dbCleanLoop = setInterval(async () => {
      const dbEntries: IActivitiesDBEntry[] = await this.client.database.get("activities");

      for (const dbEntry of dbEntries) {
        if (dbEntry.expiresAt < Date.now()) {
          await this.client.database.delete("activities", dbEntry.id);
        }
      }
    }, 5 * 60 * 1000);
  }

  public async execute(): Promise<void> {
    await this.client.database.init();
    
    this.client.user.setActivity("$activity");
    console.log("Ready");
  }

}