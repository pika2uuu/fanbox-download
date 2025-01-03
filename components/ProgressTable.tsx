import {Table} from "@mantine/core";

type DownloadItem = {
    id: number;
    targetFilename: string;
    state: string;
};

type Props = {
    inProcess: DownloadItem[];
    interrupted: DownloadItem[];
    complete: DownloadItem[];
}
export default function ProgressTable({ inProcess, interrupted, complete}: Props ){
    return (
        <>
            <Table borderColor="gray">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Td c="gray">途中</Table.Td>
                        <Table.Td c="green">完了</Table.Td>
                        <Table.Td c="yellow">エラー</Table.Td>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td>{inProcess.length}</Table.Td>
                        <Table.Td>{complete.length}</Table.Td>
                        <Table.Td>{interrupted.length}</Table.Td>
                    </Table.Tr>

                </Table.Tbody>
            </Table>
        </>
    )
}