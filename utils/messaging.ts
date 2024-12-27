import { defineExtensionMessaging } from '@webext-core/messaging';

interface MessageProtocol {
  downloadStarted: (dl: DownloadItem) => string;
  clickStart: (dlQueue: DownloadQueue) => string;
  downloadFinished: (finished: boolean) => void;
  downloadStatusUpdated: (dlStatus: DownloadStatus) => void;
  sleep: number;
}

export const { sendMessage: sendMessage, onMessage: onMessage } =
  defineExtensionMessaging<MessageProtocol>({ logger: console });
