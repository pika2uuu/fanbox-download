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
    isDownloading: boolean;
    isClicked: boolean;
    interrupted: DownloadItem[];
    inProcess: DownloadItem[];
    complete: DownloadItem[];
    handleClosed: () => void;
}

export default function ProgressArea({ isDownloading, isClicked, interrupted, inProcess, complete, handleClosed }: Props) {

    return (
        <>
            { !isDownloading && isClicked && (
                <Center>
                    <Stack>
                        <Text c="green" size="lg" >ダウンロード完了</Text>
                        <Button onClick={handleClosed}>閉じる</Button>
                    </Stack>
                </Center>
            )}
            <ProgressTable
                inProcess={inProcess}
                interrupted={interrupted}
                complete={complete}
            />
            <ScrollArea h={350} type="always" offsetScrollbars scrollbarSize={14} scrollbars="y">
                <List>
                    { interrupted.length > 0 && interrupted.map(dl => (
                        <InterruptedDownload key={dl.id} targetFilename={dl.targetFilename} />
                    ))}
                    { inProcess.length > 0 && inProcess.map(dl => (
                        <InProcessDownload key={dl.id} targetFilename={dl.targetFilename} />
                    ))}
                    {complete.map(dl => (
                        <CompletedDownload key={dl.id} targetFilename={dl.targetFilename} />
                    ))}
                </List>
            </ScrollArea>
        </>
    );
}

