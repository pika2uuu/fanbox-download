import {onMessage} from "@/utils/messaging";
import { ScrollArea, Flex, Text } from "@mantine/core";
import { InterruptedDownload, InProcessDownload, CompletedDownload } from "./DownloadItem";

type DownloadItem = {
    id: number;
    targetFilename: string;
    state: string;
};

export default function ProgressArea() {
    const [finished, setFinished] = useState<boolean>(false);
    const [allDownloads, setAllDownloads] = useState<DownloadItem[]>([]);
    const [interruptedDownloads, setInterruptedDownloads] = useState<DownloadItem[]>([]);
    const [inProcessDownloads, setInProcessDownloads] = useState<DownloadItem[]>([]);
    const [completeDownloads, setCompleteDownloads] = useState<DownloadItem[]>([]);
    const [fileCount, setFileCount] = useState<number>(0);

    useEffect(() => {
        setInterruptedDownloads(allDownloads.filter(dl => dl.state === "interrupted"));
        setInProcessDownloads(allDownloads.filter(dl => dl.state === "in_process"));
        setCompleteDownloads(allDownloads.filter(dl => dl.state === "complete"));
        setFileCount(allDownloads.length);
    }, [allDownloads]);

    useEffect(() => {
        onMessage("downloadStatusStarted", (msg) => {
            const { id, targetFilename } = msg.data;
            setAllDownloads((prev) => [...prev, { id, targetFilename, state: "in_process" }]);
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

    return (
        <>
        <Text size="xl" c="green">{fileCount}個</Text>
        <ScrollArea h={250} type="always" offsetScrollbars scrollbarSize={14} scrollHideDelay={2000}>
            <Flex direction="column" gap="sm">
                {allDownloads.length === 0 ? (
                    <Text  mt="md" c="dimmed">ダウンロードを開始します</Text>
                ) : (
                    <>
                        {interruptedDownloads.map(dl => (
                            <InterruptedDownload key={dl.id} targetFilename={dl.targetFilename} />
                        ))}
                        {inProcessDownloads.map(dl => (
                            <InProcessDownload key={dl.id} targetFilename={dl.targetFilename} />
                        ))}
                        {completeDownloads.map(dl => (
                            <CompletedDownload key={dl.id} targetFilename={dl.targetFilename} />
                        ))}
                    </>
                )}
            </Flex>
        </ScrollArea>
        </>
    );
}

