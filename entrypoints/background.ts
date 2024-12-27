import {onMessage, sendMessage} from '../utils/messaging';

export default defineBackground( async () => {
    const allDownloads: AllDownloads = {};

    onMessage('clickStart', async (dlQueue) =>  {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const maxNum = dlQueue.data.length;

        for (const [index, dl] of dlQueue.data.entries()) {
            const id = await downloadStart(dl);
            const targetFilename =  dl.fullPath
            console.log("ダウンロード開始")

            if (id !== -1) {
                // ダウンロード対象のファイルを保存しているRecordを保存するメッセージ
                await sendMessage("downloadStatusStarted", {id, targetFilename, state: "in_progress"}, tab.id);
                // TODO 
                // いらないかも。downloadQueueを廃止予定だから、ダウンロード数が全部で何個かは確定情報じゃなく変わっていくから。対象のファイルが全部の中から何個めかを保存するメッセージ。(4/60)みたいな表記のためのindexとmaxNum
                await sendMessage('downloadStarted', {targetFilename, index, maxNum }, tab.id)
            }
        }
        const finished = true
        await sendMessage('downloadFinished', finished, tab.id)
        return 'finished'
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
        const { fullPath, url, text } = dl;
        const targetFilename = fullPath
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

