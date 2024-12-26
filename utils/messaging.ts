import { defineExtensionMessaging } from '@webext-core/messaging';
import { DownloadItem} from './type'

interface MessageProtocol {
  clickStart: (dlList: DlList) => string;
  downloadStarted: (dl: DownloadItem) => string;
  downloadFinished: (finished: boolean) => void;
  downloadStatusUpdated: (dlStatus: DownloadStatus) => void;
  sleep: number;
}

export const { sendMessage: sendMessage, onMessage: onMessage } =
  defineExtensionMessaging<MessageProtocol>({ logger: console });
