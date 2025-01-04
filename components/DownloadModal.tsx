import {Center, Box, Modal, Stack, Button, ScrollArea, Progress, Text, Image, Grid, Avatar} from "@mantine/core";
import ProgressArea from "@/components/ProgressArea.tsx";
import {download} from "@/utils/download.ts";
import {fetchJson, generateUserUrls, getUserID, isCreatorPage} from "@/utils/url.ts";
import { User } from "../utils/type";
import {onMessage} from "@/utils/messaging.ts";

type DownloadItem = {
    id: number;
    targetFilename: string;
    state: string;
};

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
    const [allDownloads, setAllDownloads] = useState<DownloadItem[]>([]);
    const [interruptedDownloads, setInterruptedDownloads] = useState<DownloadItem[]>([]);
    const [inProcessDownloads, setInProcessDownloads] = useState<DownloadItem[]>([]);
    const [completeDownloads, setCompleteDownloads] = useState<DownloadItem[]>([]);
    const listenersRef = useRef<(() => void)[]>([]);
    const [finished, setFinished] = useState<boolean>(false);

    useEffect(() => {
        setInterruptedDownloads(allDownloads.filter(dl => dl.state === "interrupted"));
        setInProcessDownloads(allDownloads.filter(dl => dl.state === "in_process"));
        setCompleteDownloads(allDownloads.filter(dl => dl.state === "complete"));
    }, [allDownloads]);

    useEffect(() => {
        const removeDlStartedListener = onMessage("downloadStatusStarted", (msg) => {
            const { id, targetFilename } = msg.data;
            setAllDownloads((prev) => [...prev, { id, targetFilename, state: "in_process" }]);
        });

        const removeDlUpdatedListener =  onMessage("downloadStatusUpdated", (msg) => {
            const { id, state } = msg.data;
            setAllDownloads((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, state } : item
                )
            );
        });

        const removeDlFinishedListener = onMessage("downloadFinished", () => {
            setFinished((prev) => !prev)
        });

        listenersRef.current.push(removeDlStartedListener, removeDlUpdatedListener, removeDlFinishedListener);
    }, []);

    // TODO 別のクリエイターのページに移動したときもリスナーを解除しなきゃエラーになる。
    const handleClosed = () => {
        // 保存していたリスナーをすべて削除
        listenersRef.current.forEach((removeListener) => removeListener());
        listenersRef.current = [];

        // モーダルを閉じる
        close();
    };

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

        setCurrentUrl(window.location.href);

        // URL更新時にユーザ情報更新
        onMessage("changedUrl", async (msg) => {
            setCurrentUrl(msg.data);
            // クリエイターページのときだけユーザー情報を更新する
            if (isCreatorPage(msg.data)) {
                const user =  await fetchUser(msg.data)
                setUser(user);
            }
            // URLを変えるたびにリスナーを解除しないと一度ダウンロードして、別のユーザーをダウンロードするとき、2回目のメッセージ受信が行われるのでエラーが出る
            handleClosed();
            setIsDownloading(false);
            setIsClicked(false);
            setAllDownloads([]);
            setInterruptedDownloads([]);
            setInProcessDownloads([]);
            setCompleteDownloads([]);

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
                        <ProgressArea  isDownloading={isDownloading} isClicked={isClicked} interrupted={interruptedDownloads} inProcess={inProcessDownloads} complete={completeDownloads} handleClosed={handleClosed} />
                    </>
                ) : (
                    <>
                        <Center>
                            <Button
                                onClick={async () =>{
                                    setIsClicked(true);
                                    setIsDownloading(true)
                                    const result = await download(currentUrl);
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

