import { defineExtensionMessaging } from '@webext-core/messaging';
import {DownloadStatusForUpdate, DownloadStatusForStart, DownloadItem} from "@/utils/type.ts";

interface MessageProtocol {
  pushDownloadQueue: (dlItem: DownloadItem) => void;
  downloadFinished: (finished: boolean) => void;
    downloadStatusStarted: (activeDownloads: DownloadStatusForStart) => void;
    downloadStatusUpdated: (dlStatus: DownloadStatusForUpdate) => void;
    changedUrl: (url: string) => void;
  sleep: number;
}

export const { sendMessage: sendMessage, onMessage: onMessage } =
  defineExtensionMessaging<MessageProtocol>({ logger: console });
