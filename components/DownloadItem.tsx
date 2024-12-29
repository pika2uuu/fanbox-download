import {Flex, List, Text} from "@mantine/core";
import {IconAlertTriangle, IconCircleCheck, IconLoader} from "@tabler/icons-react";

type DownloadItemProps = {
    targetFilename: string;
};

export const InterruptedDownload = ({ targetFilename }: DownloadItemProps) => (
    <Flex align="center" gap="sm">
        <IconAlertTriangle stroke={2}  color="yellow" />
        <Text c="yellow" truncate="end">{targetFilename}</Text>
    </Flex>
);

export const InProcessDownload = ({ targetFilename }: DownloadItemProps) => (
    <Flex align="center" gap="sm">
        <IconLoader className="loading" size="20" />
        <Text c="gray" truncate="end">{targetFilename}</Text>
    </Flex>
);

export const CompletedDownload = ({ targetFilename }: DownloadItemProps) => (
    <Flex align="center" gap="sm">
        <IconCircleCheck stroke={2} size="20" color="green" />
        <Text c="green" truncate="end">{targetFilename}</Text>
    </Flex>
);