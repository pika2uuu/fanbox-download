import { Flex, Text } from "@mantine/core";
import { IconCircleCheck, IconLoader, IconX } from "@tabler/icons-react";

type DownloadItemProps = {
    targetFilename: string;
};

export const InterruptedDownload = ({ targetFilename }: DownloadItemProps) => (
    <Flex align="center" gap="sm">
        <IconX stroke={2} size="1em" color="red" />
        <Text>{targetFilename}</Text>
    </Flex>
);

export const InProcessDownload = ({ targetFilename }: DownloadItemProps) => (
    <Flex align="center" gap="sm">
        <IconLoader className="loading" size="1em" />
        <Text>{targetFilename}</Text>
    </Flex>
);

export const CompletedDownload = ({ targetFilename }: DownloadItemProps) => (
    <Flex align="center" gap="sm">
        <IconCircleCheck stroke={2} size="1em" color="green" />
        <Text c="green">{targetFilename}</Text>
    </Flex>
);