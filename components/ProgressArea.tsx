import {onMessage} from "@/utils/messaging";
import {ScrollArea, Flex, Text, List, Image, Table, Grid, Avatar} from "@mantine/core";
import { InterruptedDownload, InProcessDownload, CompletedDownload } from "./DownloadItem";
import ProgressTable from "@/components/ProgressTable.tsx";

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

    useEffect(() => {
        setInterruptedDownloads(allDownloads.filter(dl => dl.state === "interrupted"));
        setInProcessDownloads(allDownloads.filter(dl => dl.state === "in_process"));
        setCompleteDownloads(allDownloads.filter(dl => dl.state === "complete"));
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
            <ProgressTable
                inProcess={inProcessDownloads}
                interrupted={interruptedDownloads}
                complete={completeDownloads}
            />
            <ScrollArea h={350} type="always" offsetScrollbars scrollbarSize={14} scrollbars="y">
                <List>
                    { interruptedDownloads.length > 0 && interruptedDownloads.map(dl => (
                        <InterruptedDownload key={dl.id} targetFilename={dl.targetFilename} />
                    ))}
                    { inProcessDownloads.length > 0 && inProcessDownloads.map(dl => (
                        <InProcessDownload key={dl.id} targetFilename={dl.targetFilename} />
                    ))}
                    {completeDownloads.map(dl => (
                        <CompletedDownload key={dl.id} targetFilename={dl.targetFilename} />
                    ))}
                </List>
            </ScrollArea>
        </>
    );
}

