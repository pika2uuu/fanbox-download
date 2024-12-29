import {ScrollArea} from "@mantine/core";
import {onMessage} from "@/utils/messaging";
import {useEffect} from "react";
import DownloadItem from "./DownloadItem";

export default function ProgressArea() {
    const [finished, setFinished] = useState<boolean>(false);
    const [allDownloads, setAllDownloads] = useState<DownloadItem[]>([]);

    useEffect(() => {
        onMessage("downloadStatusStarted", (msg) => {
            const { id, targetFilename, state } = msg.data;
            setAllDownloads((prev) => [...prev, { id, targetFilename, state }]); // stateをDownloadStateにキャスト
        });

        onMessage("downloadStatusUpdated", (msg) => {
            const { id, state } = msg.data;
            setAllDownloads((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, state } : item
                )
            );
        });

        onMessage("downloadFinished", () => {
            setFinished((prev) => !prev)
        });
    }, []);

}

