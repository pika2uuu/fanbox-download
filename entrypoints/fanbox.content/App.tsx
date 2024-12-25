import {Flex, MantineProvider, ProgressLabel, Text} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Box, Stack, Progress, ScrollArea } from '@mantine/core';
import "@mantine/core/styles.css";
import DownloadModal from "@/components/DownloadModal.tsx";

export default () => {
    const [opened, { open, close }] = useDisclosure(false);
    return (
        <MantineProvider>
            <div>
                <DownloadModal opened={opened} close={close} />
                <Button variant="filled" color="blue" onClick={open} >
                    Download
                </Button>
            </div>
        </MantineProvider>
    )
}