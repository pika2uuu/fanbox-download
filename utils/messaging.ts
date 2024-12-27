import { defineExtensionMessaging } from '@webext-core/messaging';

interface MessageProtocol {
  clickStart: (dlQueue: DownloadQueue) => string;
  downloadStarted: (dl: DownloadJob) => string;
  downloadFinished: (finished: boolean) => void;
    downloadStatusStarted: (activeDownloads: DownloadStatus) => void;
    downloadStatusUpdated: (dlStatus: DownloadStatus) => void;
  sleep: number;
}

export const { sendMessage: sendMessage, onMessage: onMessage } =
  defineExtensionMessaging<MessageProtocol>({ logger: console });
