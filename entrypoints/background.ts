import {onMessage, sendMessage} from '../utils/messaging';

export default defineBackground( async () => {

    onMessage('pushDownloadQueue', async (dl) =>  {
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const id = await downloadStart(dl.data);
        const targetFilename = dl.data.targetFilename
        console.log(dl)
        console.log("ダウンロードキューに追加", targetFilename)
        if (id !== -1) {
            await sendMessage("downloadStatusStarted", { id, targetFilename, state: "in_progress" }, activeTab.id);
        }
    });

    chrome.downloads.onChanged.addListener(async (delta) => {
        const { id, state } = delta;
        // chrome.downloadsはbackgroundでしか使えないのでactiveTabのIDを取得する必要がある。
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        if (allDownloads[id]) {
            // downloadDeltaのうち、stateが含まれているものだけを対象。complete か interrupted
            if (state !== undefined && state.current !== undefined) {
                await sendMessage("downloadStatusUpdated", { id, state: state.current }, activeTab.id);
            }
        }
    })

    async function downloadStart(dl: DownloadItem): Promise<number> {
        const { targetFilename, url, text } = dl;
        const downloadUrl = url || await createBlobUrl(text!)

        try {
            const downloadId = await downloadFile(downloadUrl, targetFilename);
            allDownloads[downloadId] = { targetFilename, state: "in_progress" };
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

