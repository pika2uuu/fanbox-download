import { Text, Flex } from "@mantine/core";
import { IconCircleCheck, IconLoader } from "@tabler/icons-react";

type DownloadItemProps = {
    finished: boolean;
    targetFilename: string;
};

export default function DownloadItem({ finished, targetFilename}: DownloadItemProps) {
    return (
        <Flex align="center">
            {finished ? (
                <>
                    <Text style={{ verticalAlign: "bottom" }}>
                        <IconCircleCheck stroke={2} size="1em" color="green" />
                    </Text>
                    <Text c="green">{targetFilename}</Text>
                </>
            ) : (
                <>
                    <Text style={{ verticalAlign: "bottom" }}>
                        <IconLoader className="loading" size="1em" />
                    </Text>
                    <Text>{targetFilename}</Text>
                </>
            )}
        </Flex>
    );
}
