import {onMessage1, sendMessage1} from '../utils/messaging';
import { Download} from "@/utils/type.ts";

export default defineBackground( async () => {
    onMessage1('ping', async (dlList) =>  {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const maxNum = dlList.data.length;
        for (const [index, dl] of dlList.data.entries()) {
            await sendMessage1('uploadFile', {dl, index, maxNum }, tab.id)
        }

        const finished = true
        await sendMessage1('uploadFinished', finished, tab.id)
        return 'finished'
    });
});



async function downloadFile(dl: Download): Promise<void> {
    if (!dl.url && !dl.text) {
        console.error("保存ファイルのURLか投稿内容のテキストが存在しません");
        return;
    }
    const downloadUrl = dl.url ?? await createDataUrl(dl.text!);
    const path = `downloads/${dl.dirname.replaceAll("/", "-")}/${dl.filename}`;

    chrome.downloads.download({
        url: downloadUrl,
        filename: path,
        saveAs: false,
        conflictAction: 'uniquify'
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error(`ファイルのダウンロードに失敗: ${chrome.runtime.lastError.message}`);
        } else {
            console.log('ファイルのダウンロードを開始', downloadId);
        }
    });
}

async function createDataUrl(text: string): Promise<string> {
    const blob = new Blob([text], { type: 'text/plain' });
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("テキストデータからBlobへの変換でエラーが発生"));
        reader.readAsDataURL(blob);
    })
}
