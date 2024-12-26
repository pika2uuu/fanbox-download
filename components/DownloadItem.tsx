import { Text, Flex } from "@mantine/core";
import { IconCircleCheck, IconLoader } from "@tabler/icons-react";

type DownloadItemProps = {
    finished: boolean;
    path: string;
    index: number;
    maxNum: number;
};

export default function DownloadItem({ finished, path, index, maxNum }: DownloadItemProps) {
    return (
        <Flex align="center">
            {finished ? (
                <>
                    <Text style={{ verticalAlign: "bottom" }}>
                        <IconCircleCheck stroke={2} size="1em" color="green" />
                    </Text>
                    <Text c="green">{path}</Text>
                </>
            ) : (
                <>
                    <Text style={{ verticalAlign: "bottom" }}>
                        <IconLoader className="loading" size="1em" />
                    </Text>
                    <Text>{path}</Text>
                </>
            )}
        </Flex>
    );
}
