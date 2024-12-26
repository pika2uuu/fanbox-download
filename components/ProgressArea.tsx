import {Progress, ScrollArea} from "@mantine/core";
import {onMessage1} from "@/utils/messaging";
import {useEffect} from "react";
import {DlInfo} from "../utils/type"
import DownloadItem from "./DownloadItem";

type IndexPair = {
    index: number;
    maxNum: number;
}

export default function ProgressArea() {
    const [downloads, setDownloads] = useState<DlInfo[]>([]);
    const [finished, setFinished] = useState<boolean>(false);
    const [indexPair, setIndexPair] = useState<IndexPair>({index: 0, maxNum: 0})
    const [percent, setPercent] = useState<number>(0);

    useEffect(() => {
        let result;
        console.log
        if (indexPair.index == 0) {
            result = 0
            console.log(result, 'パーセント')

        } else if (finished) {
            result = 100
            console.log(result, 'パーセント')

        } else {
            result = indexPair.index / indexPair.maxNum * 100
            console.log(result, 'パーセント')
        }
        setPercent(result);
        console.log("indexPair更新")
    }, [indexPair, finished])

    useEffect(() => {
        // メッセージリスナーを登録
        onMessage1('uploadFile', (msg) => {
            console.log("backgroundからメッセージを受け取った");
            const nextDownload: DlInfo = { path: `${msg.data.dl.dirname}/${msg.data.dl.filename}`, index: msg.data.index, maxNum: msg.data.maxNum };
            setIndexPair({ index: nextDownload.index, maxNum: nextDownload.maxNum });
            console.log(indexPair)

            console.log(indexPair)
            setDownloads((prev) => [...prev, nextDownload]);
        });

        onMessage1('uploadFinished', (msg) => {
            console.log('ダウンロードが終わり');
            setFinished((prev) => !prev)
        })
    }, []);
    return (
        <>
            <Progress.Root size="20">
                <Progress.Section value={percent} color="green">
                    <Progress.Label>(`{progress(indexPair)}`)</Progress.Label>
                </Progress.Section>
            </Progress.Root>
            {/*<ProgressStatus />*/}
            <ScrollArea h={250} type="always" offsetScrollbars scrollbarSize={14} scrollHideDelay={2000}>
                {/*新しいのを上に表示したいので逆順にする。*/}
                {downloads.slice().reverse().map((dlInfo, i) => {
                    console.log(percent)
                    console.log(dlInfo);
                    if (finished) {
                        return (
                            <DownloadItem key={i} finished={true} path={dlInfo.path} index={dlInfo.index} maxNum={dlInfo.maxNum} />
                        );
                    } else if (i === 0) {
                        // i が 0 の場合
                        return (
                            <DownloadItem key={i} finished={false} path={dlInfo.path} index={dlInfo.index} maxNum={dlInfo.maxNum} />
                        );
                    } else {
                        // その他の条件
                        return (
                            <DownloadItem key={i} finished={true} path={dlInfo.path} index={dlInfo.index} maxNum={dlInfo.maxNum} />
                        );
                    }
                })}
            </ScrollArea>
        </>
    )
}

function progress(indexPair: IndexPair) {
    let result;
    if (indexPair.index == 0) {
        result = "(0/0)"
    } else {
        result = `${indexPair.index}/${indexPair.maxNum}`
    }
    return result;
}