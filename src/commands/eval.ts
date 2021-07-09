import { IBotCommand, PermissionLevel } from "../typings/index";
import { Message } from "discord.js";
import { inspect } from "util";

export default class implements IBotCommand {
  public readonly aliases: string[];
  public readonly ltu: PermissionLevel;
  public readonly name: string;

  public constructor() {
    this.name = "eval";
    this.ltu = PermissionLevel.BotDev;
    this.aliases = [];
  }

  public execute(message: Message): Promise<Message | void> {
    const codeMatch = /(?:eval)\s+(?:(--async)\s+)?([\w\W]+)/.exec(message.content);
    if (!codeMatch) return message.channel.send("No code input");

    try {
      const output = eval(
        codeMatch[1]
          ? `(async () => { ${codeMatch[2]} })();`
          : codeMatch[2]
      );

      if (output instanceof Promise) {
        output.then(o => {
          message.channel.send(this._generateOutput(codeMatch[2], o, false, !!codeMatch[1]));
        }).catch(err => {
          message.channel.send(this._generateOutput(codeMatch[2], err, true, !!codeMatch[1]));
        });
      } else {
        message.channel.send(this._generateOutput(codeMatch[2], output, false, !!codeMatch[1]));
      }
    } catch (err) {
      message.channel.send(this._generateOutput(codeMatch[2], err, true, !!codeMatch[1]));
    }
  }

  private _generateOutput(input: string, output: any, err: boolean, async: boolean): string {
    let toReturn = "";

    toReturn += `\`INPUT${async ? " (async)" : ""}:\`\n`;
    toReturn += `\`\`\`js\n${input}\n\`\`\`\n`;

    output = output instanceof Object ? inspect(output, { depth: 0 }) : output;

    toReturn += err ? "`ERR:`\n" : "`OUTPUT:`\n";

    if (String(output).length > 2000 - toReturn.length) {
      toReturn += "```\nToo long; See console\n```\n";
      console.log(output);
    } else toReturn += `\`\`\`js\n${output}\n\`\`\`\n`;

    return toReturn;
  }
}