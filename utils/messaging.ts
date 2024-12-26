import { defineExtensionMessaging } from '@webext-core/messaging';
import { DownloadItem} from './type'

interface MessageProtocol {
  downloadStart: (dlList: DlList) => string;
  uploadFile: (dl: DownloadItem) => string;
  uploadFinished: (finished: boolean) => void;
  downloadStatusUpdated: (dlStatus: DownloadStatus) => void;
  sleep: number;
}

export const { sendMessage: sendMessage, onMessage: onMessage } =
  defineExtensionMessaging<MessageProtocol>({ logger: console });
