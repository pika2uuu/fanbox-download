import { Modal, Stack, Button, ScrollArea, Progress } from "@mantine/core";
import ProgressArea from "@/components/ProgressArea.tsx";
import {download} from "@/utils/download.ts";

type Props = {
    opened: boolean;
    close: () => void;
};

export default function DownloadModal({ opened, close }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);
    return (
        <Modal opened={opened} onClose={close}>
            <Stack h={300} bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="md">
                { isDownloading ? (
                    <>
                        <ProgressArea />
                    </>
                ) : (
                    <>
                        <Button
                            variant="filled"
                            onClick={async () =>{
                                setIsDownloading(!isDownloading)
                                await download()
                            }}
                        >
                            ユーザー投稿をダウンロード
                        </Button>
                    </>
                )}
            </Stack>
        </Modal>
    );
}
