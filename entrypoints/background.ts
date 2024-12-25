import {onMessage1, sendMessage1} from '../utils/messaging';
import { Download} from "@/utils/type.ts";

export default defineBackground( async () => {
    onMessage1('ping', async (dlList) =>  {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        for (const item of dlList.data) {
            await sendMessage1('uploadFile', item, tab.id)
        }
        return 'finished'
    });
});

async function downloadTextFile(text: string, filePath: string): Promise<void> {
    const blob = new Blob([text], { type: 'text/plain' });
    const reader = new FileReader();

    reader.onloadend = () => {
        const url = reader.result as string;
        chrome.downloads.download({
            url: url,
            filename: filePath,
            saveAs: false,
            conflictAction: 'uniquify'
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error('Error downloading text file:', chrome.runtime.lastError);
            } else {
                console.log('Text file download started:', downloadId);
            }
        });
    };

    reader.readAsDataURL(blob); // FileReader でBlobをDataURLに変換
}

async function downloadImageFile(url: string, filePath: string): Promise<void> {
    chrome.downloads.download({
        url: url,
        filename: filePath,
        saveAs: false,
        conflictAction: 'uniquify',
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error(`画像ファイルのダウンロード中にエラーが発生 file: [${filePath}] ${downloadId}]. Error: ${chrome.runtime.lastError}`);
        } else {
            console.log(`画像ファイルのダウンロード開始 ${downloadId}`);
        }
    });
}

async function downloadFile(dl: Download): Promise<void> {
    const { dirname, filename, url, text } = dl;
    const filePath = `downloads/${dirname.replaceAll("/", "-")}/${filename}`; // 日付の区切りで / を使ってる場合 - に変換

    if (url) {
        await downloadImageFile(url, filePath);
    } else if (text) {
        await downloadTextFile(text, filePath)
    }
}