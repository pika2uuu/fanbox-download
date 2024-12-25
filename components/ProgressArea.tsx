import {Progress, ScrollArea} from "@mantine/core";
import DownloadItem from "@/components/DownloadItem.tsx";
import {onMessage1} from "@/utils/messaging";
import {useEffect} from "react";

type dlInfo = {
    filename: string;
}

export default function ProgressArea() {
    const [downloads, setDownloads] = useState<dlInfo[]>([]);

    useEffect(() => {
        const messageHandler = (message: { data: { filename: string } }) => {
            console.log("backgroundからメッセージを受け取った");
            const nextDownload: dlInfo = { filename: message.data.filename };
            setDownloads((prev) => [...prev, nextDownload]);
        };
        // メッセージリスナーを登録
        onMessage1('uploadFile', messageHandler);
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
                {downloads.map((item, i) => (
                    i === 0 ? (
                        <DownloadItem finished={false} filename={item.filename} key={i} />
                    ) : (
                        <DownloadItem finished={true} filename={item.filename} key={i} />
                    )
                ))}
            </ScrollArea>
        </>
    )
}