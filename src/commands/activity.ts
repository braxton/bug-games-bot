import { Message } from "discord.js";
import fetch from "node-fetch";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { IBotCommand, PermissionLevel, ActivityType, IActivitiesDBEntry } from "../typings/index";

const validActivities = {
  "poker": "755827207812677713",
  "betrayal": "773336526917861400",
  "youtube": "755600276941176913",
  "fishing": "814288819477020702",
  "chess": "832012774040141894"
};

export default class implements IBotCommand {
  public readonly aliases: string[];
  public readonly ltu: PermissionLevel;
  public readonly name: string;

  public constructor() {
    this.name = "activity";
    this.ltu = PermissionLevel.User;
    this.aliases = [];
  }

  public async execute(message: Message): Promise<void> {
    const input = message.content.split(" ")[1];
    if (!Object.keys(validActivities).includes(input)) {
      const activitiesList = Object.keys(validActivities).map(a => `\`${a}\``);
      await message.reply(`ERR: Invalid activity - Try any of these: ${activitiesList.join(", ")}`);
      return;
    }

    const selActivity = input as ActivityType;
    const selActivityID = validActivities[selActivity];

    const memberVoice = message.member.voice;
    if (!memberVoice.channelID) {
      await message.reply("ERR: You are not in a voice channel");
      return;
    }
    if (!memberVoice.channel.permissionsFor(message.guild.me).has("CREATE_INSTANT_INVITE")) {
      await message.reply("ERR: I cannot create invites for the voice channel you are in");
      return;
    }

    // Wait until after checks to extend
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const formatString = "[Expires at: `]YYYY-MM-DD @ hh:mm:ss A[ ET`]";

    const dbEntry: IActivitiesDBEntry = await message.client.database.get("activities", `${memberVoice.channelID}-${selActivityID}`);
    if (dbEntry) {
      const expireString = dayjs(dbEntry.expiresAt)
        .tz(process.env.TIMEZONE)
        .format(formatString);

      await message.reply(`An existing link has been found - ${expireString}\nhttps://discord.gg/${dbEntry.code} (Click on the link)`);
      return;
    }

    const res: any = await fetch(`https://discord.com/api/v8/channels/${memberVoice.channelID}/invites`, {
      method: "POST",
      body: JSON.stringify({
        max_age: 86400,
        max_uses: 0,
        target_application_id: selActivityID,
        target_type: 2,
        temporary: false,
        validate: null
      }),
      headers: {
        "Authorization": `Bot ${message.client.token}`,
        "Content-Type": "application/json"
      }
    }).then(response => response.json());

    if (!res.code) {
      console.error(res);
      const owner = await message.client.users.fetch(process.env.OWNER);
      await message.reply(`ERR: Unable to generate invite code. Please contact ${owner.tag}`);
      return;
    }

    const toInsert: IActivitiesDBEntry = {
      id: `${memberVoice.channelID}-${selActivityID}`,
      code: res.code,
      expiresAt: Date.now() + (86400 * 1000)
    };
    await message.client.database.insert("activities", toInsert);

    const expireString = dayjs(toInsert.expiresAt)
      .tz(process.env.TIMEZONE)
      .format(formatString);
    await message.reply(`A new link has been created - ${expireString}\nhttps://discord.gg/${res.code} (Click on the link)`);
    return;
  }
}