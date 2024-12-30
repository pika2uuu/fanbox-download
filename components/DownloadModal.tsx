import {Modal, Stack, Button, ScrollArea, Progress, Text, Image, Grid, Avatar} from "@mantine/core";
import ProgressArea from "@/components/ProgressArea.tsx";
import {download} from "@/utils/download.ts";
import {fetchJson, generateUserUrls} from "@/utils/url.ts";
import { User } from "../utils/type";

type Props = {
    opened: boolean;
    close: () => void;
};

export default function DownloadModal({ opened, close }: Props) {
    const [currentUrl, setCurrentUrl] = useState(window.location.href);
    const [isDownloading, setIsDownloading] = useState(false);
    const defaultUser: User = {
        userId: "",
        name: "Guest",
        iconUrl: "https://example.com/default-icon.png",
    };
    const [user, setUser] = useState<User>(defaultUser);

    // URLが変化したときダウンロード対象とするクリエイターを変更する
    useEffect(() => {
        onMessage("changedUrl", async (msg) => {
            console.log(msg)
            const { profileAPIUrl } = generateUserUrls(msg.data);
            const json = await fetchJson(profileAPIUrl);
            const userJson = json.body;
            const user: User = { userId: userJson.creatorId, name:userJson.user.name, iconUrl: userJson.user.iconUrl }
            setUser(user);
        });
    }, []);

    return (
        <Modal opened={opened} onClose={close}>
            <Stack h={300} bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="md">
                { isDownloading ? (
                    <>
                        <ProgressArea />
                        <>
                            <Text>ダウンロード中</Text>
                            <Image radius="md" h={180} w="auto" fit="contain" src="https://gist.github.com/brudnak/aba00c9a1c92d226f68e8ad8ba1e0a40/raw/e1e4a92f6072d15014f19aa8903d24a1ac0c41a4/nyan-cat.gif" />
                        </>
                    </>
                ) : (
                    <>
                        <Grid gutter="md">
                            <Grid.Col span={2}>
                                <Avatar src={user.iconUrl} />
                            </Grid.Col>
                            <Grid.Col span={10}>
                                {user.name}
                            </Grid.Col>
                            <Grid.Col span={12}>
                                テーブル
                            </Grid.Col>
                        </Grid>
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
