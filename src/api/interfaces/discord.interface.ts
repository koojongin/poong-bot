import { Client, Message } from 'discord.js';

export interface IExecuteCommand {
  msg: Message;
  client: Client;
  actionMessage: string;
}
