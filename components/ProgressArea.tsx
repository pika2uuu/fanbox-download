import {Progress, ScrollArea} from "@mantine/core";
import {onMessage} from "@/utils/messaging";
import {useEffect} from "react";
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
    const [allDownloads, setAllDownloads] = useState<AllDownloads>([]);
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
        // 各ファイルのダウンロードが開始した直後に受け取るメッセージ。10個ファイルがあれば10回メッセージを受け取る
        onMessage('downloadStarted', (msg) => {
            const { targetFilename, index, maxNum } = msg.data;
            setIndexPair({ index, maxNum: maxNum });
        });

        // ダウンロード開始に成功した直後。
        onMessage("downloadStatusStarted", (msg) => {
            const { id, targetFilename, state} = msg.data;
            setAllDownloads((prev) => ({
                ...prev,
                [id]: { targetFilename, state },
            }));
        })

        // ダウンロード進行状況が更新された直後。
        onMessage("downloadStatusUpdated", (msg) => {
            const { id, state } = msg.data;
            setAllDownloads((prev) => ({
                ...prev,
                [id]: { ...prev[id], state },
            }));
        })

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
                {Object.entries(allDownloads).reverse().map(([id, dl]) => {
                    const {targetFilename, state} = dl;

                    console.log(targetFilename, state)
                    if (state == "in_progress") {
                        return <DownloadItem key={id} finished={false} targetFilename={targetFilename}  />
                    }else {
                        return <DownloadItem key={id} finished={true} targetFilename={targetFilename}  />
                    }
                })}
            </ScrollArea>
        </>
    )
}

