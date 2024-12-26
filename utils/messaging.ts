import { defineExtensionMessaging } from '@webext-core/messaging';
import { DownloadItem} from './type'

interface MessageProtocol {
  ping: (dlList: DlList) => string;
  uploadFile: (dl: DownloadItem) => string;
  uploadFinished: (finished: boolean) => void;
  downloadStatusUpdated: (dlStatus: DownloadStatus) => void;
  sleep: number;
}

export const { sendMessage: sendMessage1, onMessage: onMessage1 } =
  defineExtensionMessaging<MessageProtocol>({ logger: console });
