import {onMessage} from "@/utils/messaging";
import {ScrollArea, Flex, Text, List, Image, Table, Grid, Avatar, Button, Center, Stack} from "@mantine/core";
import { InterruptedDownload, InProcessDownload, CompletedDownload } from "./DownloadItem";
import ProgressTable from "@/components/ProgressTable.tsx";

type DownloadItem = {
    id: number;
    targetFilename: string;
    state: string;
};

interface Props {
    close: () => void;
    isDownloading: boolean;
    isClicked: boolean;
}

export default function ProgressArea({ close, isDownloading, isClicked }: Props) {
    const [finished, setFinished] = useState<boolean>(false);
    const [allDownloads, setAllDownloads] = useState<DownloadItem[]>([]);
    const [interruptedDownloads, setInterruptedDownloads] = useState<DownloadItem[]>([]);
    const [inProcessDownloads, setInProcessDownloads] = useState<DownloadItem[]>([]);
    const [completeDownloads, setCompleteDownloads] = useState<DownloadItem[]>([]);
    const listenersRef = useRef<(() => void)[]>([]);

    useEffect(() => {
        setInterruptedDownloads(allDownloads.filter(dl => dl.state === "interrupted"));
        setInProcessDownloads(allDownloads.filter(dl => dl.state === "in_process"));
        setCompleteDownloads(allDownloads.filter(dl => dl.state === "complete"));
    }, [allDownloads]);

    useEffect(() => {
        const removeDlStartedListener = onMessage("downloadStatusStarted", (msg) => {
            const { id, targetFilename } = msg.data;
            setAllDownloads((prev) => [...prev, { id, targetFilename, state: "in_process" }]);
        });

        const removeDlUpdatedListener =  onMessage("downloadStatusUpdated", (msg) => {
            const { id, state } = msg.data;
            setAllDownloads((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, state } : item
                )
            );
        });

        const removeDlFinishedListener = onMessage("downloadFinished", () => {
            setFinished((prev) => !prev)
        });

        listenersRef.current.push(removeDlStartedListener, removeDlUpdatedListener, removeDlFinishedListener);
    }, []);

    const handleClicked = () => {
        // 保存していたリスナーをすべて削除
        listenersRef.current.forEach((removeListener) => removeListener());
        listenersRef.current = [];

        // モーダルを閉じる
        close();
    };


    return (
        <>
            { !isDownloading && isClicked && (
                <Center>
                    <Stack>
                        <Text c="green" size="lg" >ダウンロード完了</Text>
                        <Button onClick={handleClicked}>閉じる</Button>
                    </Stack>
                </Center>
            )}
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

