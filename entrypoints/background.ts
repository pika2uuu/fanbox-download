import {onMessage, sendMessage} from '../utils/messaging';

export default defineBackground( async () => {

    onMessage('pushDownloadQueue', async (dl) =>  {
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const id = await downloadStart(dl.data);
        const targetFilename = dl.data.targetFilename
        console.log("ダウンロードキューに追加", targetFilename)
        if (id !== -1) {
            await sendMessage("downloadStatusStarted", { id, targetFilename }, activeTab.id);
        }
    });

    // ページ移動したときURLを送信する
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        console.log(changeInfo)
        // ページ移動に完成したら {status: 'complete'} が発生する。そのときのtabのurlを送信する
        // if (changeInfo.status === "complete" && tab.url) {
        console.log(tab)
        console.log(tabId)
        if (changeInfo.url && tab.url) {
            sendMessage("changedUrl", tab.url, tabId);
        }
    })

    chrome.downloads.onChanged.addListener(async (delta) => {
        const { id, state } = delta;
        // downloadDeltaは複数種類の変更が含まれてて、今回はstateが含まれているものだけを抽出
        if (state !== undefined && state.current !== undefined) {
            // BackGround-> Content のメッセージを送るにはtabのid が必要。
            const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            await sendMessage("downloadStatusUpdated", { id, state: state.current }, activeTab.id);
        }
    })

    async function downloadStart(dl: DownloadItem): Promise<number> {
        const { targetFilename, url, text } = dl;
        const downloadUrl = url || await createBlobUrl(text!)

        try {
            // browser.downloads.download の返り値はそのファイルのダウンロード状況に紐づく一意のID
            return await downloadFile(downloadUrl, targetFilename);
        } catch (error) {
            console.error(`ダウンロードに失敗しました : ${error}`);
            return -1;
        }
    }

    async function downloadFile(url: string, filePath: string): Promise<number> {
        return browser.downloads.download({
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

