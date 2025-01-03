import {Center, Box, Modal, Stack, Button, ScrollArea, Progress, Text, Image, Grid, Avatar} from "@mantine/core";
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
    const [isClicked, setIsClicked] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const defaultUser: User = {
        userId: "",
        name: "Guest",
        iconUrl: "https://example.com/default-icon.png",
    };
    const [user, setUser] = useState<User>(defaultUser);

    // urlからユーザー情報のオブジェクトを作成
    async function fetchUser(url: string) : Promise<User>{
        const { profileAPIUrl } = generateUserUrls(url);
        const json = await fetchJson(profileAPIUrl);
        const userJson = json.body;
        return  { userId: userJson.creatorId, name:userJson.user.name, iconUrl: userJson.user.iconUrl }
    }

    useEffect(() => {
        // 初回ロード時にユーザ情報更新
        async function setCurrentUrl(url: string) {
            console.log(url, "ユーザーを取得");
            const user = await fetchUser(url);
            setUser(user);
        }
        setCurrentUrl(window.location.href);

        // URL更新時にユーザ情報更新
        onMessage("changedUrl", async (msg) => {
            const user =  await fetchUser(msg.data)
            setUser(user);
        });
    }, []);

    return (
        <Modal opened={opened} onClose={close} withCloseButton={false} >
            <Stack h={480} bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="md">
                <Center h={40}  >
                    <Avatar src={user.iconUrl} />
                    <Text> {user.name}</Text>
                </Center>

                { isDownloading && isClicked && (
                    <Center>
                        <Stack>
                            <Text>ダウンロード中</Text>
                        </Stack>
                    </Center>
                )}

                { !isDownloading && isClicked && (
                    <Center>
                        <Stack>
                            <Text c="green" size="lg" >ダウンロード完了</Text>
                            <Button onClick={close}>閉じる</Button>
                        </Stack>
                    </Center>
            )}

                { isClicked ? (
                    <>
                        <ProgressArea />
                    </>
                ) : (
                    <>
                        <Center>
                            <Button
                                onClick={async () =>{
                                    setIsClicked(true);
                                    setIsDownloading(true)
                                    const result = await download()
                                    setIsDownloading(result);
                                }}
                                w = {200}
                            >
                                投稿をダウンロード
                            </Button>
                        </Center>
                    </>
                )}
            </Stack>
        </Modal>
    );
}

