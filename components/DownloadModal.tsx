import {Center, Box, Modal, Stack, Button, ScrollArea, Progress, Text, Image, Grid, Avatar} from "@mantine/core";
import ProgressArea from "@/components/ProgressArea.tsx";
import {download} from "@/utils/download.ts";
import {fetchJson, generateUserUrls, getUserID, isCreatorPage} from "@/utils/url.ts";
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

    // TODO 非クリエイターページならクリックできないようにして、クリエイターページに移動するよう促すツールチップを表示
    useEffect(() => {
        // 初回ロード時にユーザ情報更新
        async function setCurrentUser(url: string) {
            // クリエイターページのときだけユーザー情報を更新する
            if (isCreatorPage(url)) {
                const user = await fetchUser(url);
                console.log(user);
                setUser(user);
            }
        }
        setCurrentUser(window.location.href);

        // URL更新時にユーザ情報更新
        onMessage("changedUrl", async (msg) => {
            // クリエイターページのときだけユーザー情報を更新する
            if (isCreatorPage(msg.data)) {
                const user =  await fetchUser(msg.data)
                setUser(user);
            }
        });
    }, []);

    // TODO モーダルを閉じるときオーバーレイをクリックしたときもイベントリスナーを解除する必要がある
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

                { isClicked ? (
                    <>
                        <ProgressArea close={close} isDownloading={isDownloading} isClicked={isClicked}  />
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

