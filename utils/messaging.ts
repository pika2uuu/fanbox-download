import { defineExtensionMessaging } from '@webext-core/messaging';
import {DownloadStatusForUpdate, DownloadStatusForStart} from "@/utils/type.ts";

interface MessageProtocol {
  clickStart: (dlQueue: DownloadQueue) => string;
  downloadStarted: (dl: DownloadJob) => string;
  downloadFinished: (finished: boolean) => void;
    downloadStatusStarted: (activeDownloads: DownloadStatusForStart) => void;
    downloadStatusUpdated: (dlStatus: DownloadStatusForUpdate) => void;
  sleep: number;
}

export const { sendMessage: sendMessage, onMessage: onMessage } =
  defineExtensionMessaging<MessageProtocol>({ logger: console });
