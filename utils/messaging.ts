import { defineExtensionMessaging } from '@webext-core/messaging';
import { DlList } from './type'

interface MessageProtocol {
  ping: (dlList: DlList) => string;
  uploadFile: (dl: Download) => string;
  sleep: number;
}

export const { sendMessage: sendMessage1, onMessage: onMessage1 } =
  defineExtensionMessaging<MessageProtocol>({ logger: console });
