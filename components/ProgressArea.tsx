import {Progress, ScrollArea} from "@mantine/core";
import {onMessage} from "@/utils/messaging";
import {useEffect} from "react";
import {DlInfo} from "../utils/type"
import DownloadItem from "./DownloadItem";

type IndexPair = {
    index: number;
    maxNum: number;
}

type Progress = {
    percent: number;
    label: string;
}

export default function ProgressArea() {
    const [downloads, setDownloads] = useState<DlInfo[]>([]);
    const [finished, setFinished] = useState<boolean>(false);
    const [indexPair, setIndexPair] = useState<IndexPair>({index: 0, maxNum: 0})
    const [progress, setProgress] = useState<Progress>({ percent: 0, label: "0/0"});

    useEffect(() => {
        let percent;
        let label
        if (indexPair.index == 0) {
            percent = 0
            label = '0/0'
        } else if (finished) {
            percent = 100
            label = `${indexPair.maxNum}/${indexPair.maxNum}`
        } else {
            percent = 100
            label = `${indexPair.maxNum}/${indexPair.maxNum}`
        }
        setProgress({percent, label});
    }, [indexPair, finished])

    useEffect(() => {
        // メッセージリスナーを登録
        onMessage('downloadStarted', (msg) => {
            console.log("backgroundからメッセージを受け取った");
            const nextDownload: DlInfo = { targetFileName: `${msg.data.dl.dirname}/${msg.data.dl.filename}`, index: msg.data.index, maxNum: msg.data.maxNum };
            setIndexPair({ index: nextDownload.index, maxNum: nextDownload.maxNum });
            setDownloads((prev) => [...prev, nextDownload]);
        });

        onMessage('downloadFinished', (msg) => {
            console.log('ダウンロードが終わり');
            setFinished((prev) => !prev)
        })
    }, []);
    return (
        <>
            <Progress.Root size="20">
                <Progress.Section value={progress.percent} color="green">
                    <Progress.Label>(`{progress.label}`)</Progress.Label>
                </Progress.Section>
            </Progress.Root>
            {/*<ProgressStatus />*/}
            <ScrollArea h={250} type="always" offsetScrollbars scrollbarSize={14} scrollHideDelay={2000}>
                {/*新しいのを上に表示したいので逆順にする。*/}
                {downloads.slice().reverse().map((dlInfo, i) => {
                    const targetFilename = dlInfo.targetFileName;
                    if (finished) {
                        return (
                            <DownloadItem key={i} finished={true} targetFilename={targetFilename} />
                        );
                    } else if (i === 0) {
                        // i が 0 の場合
                        return (
                            <DownloadItem key={i} finished={false} targetFilename={targetFilename}  />
                        );
                    } else {
                        // その他の条件
                        return (
                            <DownloadItem key={i} finished={true} targetFilename={targetFilename}  />
                        );
                    }
                })}
            </ScrollArea>
        </>
    )
}

