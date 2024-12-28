import {ScrollArea} from "@mantine/core";
import {onMessage} from "@/utils/messaging";
import {useEffect} from "react";
import DownloadItem from "./DownloadItem";

export default function ProgressArea() {
    const [allDownloads, setAllDownloads] = useState<AllDownloads>([]);
    const [finished, setFinished] = useState<boolean>(false);

    useEffect(() => {
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
            {/*<ProgressStatus />*/}
            <ScrollArea h={250} type="always" offsetScrollbars scrollbarSize={14} scrollHideDelay={2000}>
                {Object.entries(allDownloads).reverse().map(([id, dl]) => {
                    const {targetFilename, state} = dl;

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

