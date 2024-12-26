import {Progress, ScrollArea} from "@mantine/core";
import {onMessage1} from "@/utils/messaging";
import {useEffect} from "react";
import {DlInfo} from "../utils/type"
import DownloadItem from "./DownloadItem";


export default function ProgressArea() {
    const [downloads, setDownloads] = useState<DlInfo[]>([]);
    const [finished, setFinished] = useState<boolean>(false);

    useEffect(() => {
        // メッセージリスナーを登録
        onMessage1('uploadFile', (msg) => {
            console.log("backgroundからメッセージを受け取った");
            const nextDownload: DlInfo = { path: `${msg.data.dl.dirname}/${msg.data.dl.filename}`, index: msg.data.index, maxNum: msg.data.maxNum };
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
                <Progress.Section value={35} color="green">
                    <Progress.Label>(4/60)</Progress.Label>
                </Progress.Section>
            </Progress.Root>
            {/*<ProgressStatus />*/}
            <ScrollArea h={250} type="always" offsetScrollbars scrollbarSize={14} scrollHideDelay={2000}>
                {/*新しいのを上に表示したいので逆順にする。*/}
                {downloads.slice().reverse().map((dlInfo, i) => {
                    console.log(i, dlInfo.maxNum, finished);
                    console.log(dlInfo.path)
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