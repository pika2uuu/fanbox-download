import {onMessage1, sendMessage1} from '../utils/messaging';
import { Download} from "@/utils/type.ts";

export default defineBackground( async () => {
    const activeDownloads: ActiveDownloads = {};

    async function downloadStart(dl: Download): Promise<number> {
        const { dirname, filename, url, text } = dl;
        const targetFilename = `downloads/${dirname.replaceAll("/", "-")}/${filename}`;
        const downloadUrl = url || await createBlobUrl(text!)

        try {
            const downloadId = await downloadFile(downloadUrl, targetFilename);
            activeDownloads[downloadId] = { targetFilename, status: "in_progress" };
            return downloadId;
        } catch (error) {
            console.error(`ダウンロードに失敗しました : ${error}`);
            return -1;
        }
    }

    async function downloadFile(url: string, filePath: string): Promise<number> {
        return chrome.downloads.download({
            url: url,
            filename: filePath,
            conflictAction: 'uniquify',
            saveAs: false,
        });
    }

    onMessage1('ping', async (dlList) =>  {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const maxNum = dlList.data.length;
        for (const [index, dl] of dlList.data.entries()) {
            const downloadId = await downloadStart(dl);
            console.log("ダウンロード開始")
            if (downloadId !== -1) {
                await sendMessage1('uploadFile', {dl, index, maxNum }, tab.id)
            }
        }

        const finished = true
        await sendMessage1('uploadFinished', finished, tab.id)
        return 'finished'
    });

    chrome.downloads.onChanged.addListener(delta => {
        const { id, state } = delta;

        if (activeDownloads[id]) {
            if (state?.current == "complete") {
                activeDownloads[id].status = "complete";
            } else if (state?.current == "interrupted") {
                activeDownloads[id].status = "interrupted";
            }
        }

        // state は必須ではないので、tateがない場合は上の条件分岐で再代入されないので同じ状態が送られるだけ
        sendMessage1("downloadStatusUpdated", { id, status: activeDownloads[id].status });
    })

    async function createBlobUrl(text: string): Promise<string> {
        const blob = new Blob([text], { type: 'text/plain' });
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("テキストデータからBlobへの変換でエラーが発生"));
            reader.readAsDataURL(blob);
        })
    }

});

