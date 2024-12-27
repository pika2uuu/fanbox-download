// import {logger} from "@/utils/logger.ts";
// import {Profile, Plan, Post, ArticleBody, DlList, ImageBody, VideoBody, ImageProfileItem, VideoProfileItem} from "@/utils/type.ts";
import { sendMessage } from '../utils/messaging'

export async function download() {
    // let ignorePaywall = true; // 支援金額が足りないとき、タイトルなど一部のデータを取得するかを尋ねる
    // let ignoreFreePlan = true;
    const url = ""
    const dlQueue: DownloadQueue = [];
    // const url = ""
    // const url = ""
    // const url = ""
    const { profileAPIUrl, allPagesAPIUrl, plansAPIUrl, shopAPIUrl } = generateUserUrls(url);

    const postUrls = await generateAllPostUrls(allPagesAPIUrl);

    if (postUrls.length == 0) {
        console.warn("投稿されている記事が１つもないので終了します")
        return;
    }

    // 現在は支援金額をみたしている投稿だけ表示している。
    for (const postUrl of postUrls) {
        const postJson = await fetchData(postUrl);
        const post = extractPostData(postJson); // fetchでJSON取得直後に不要なキーを削除したPost型に変換
        // 支援金額た足りない場合、 isRestricted が true
        if (post.isRestricted) {
            console.warn(`支援金額が足りないためコンテンツを取得できませんでした。title:『${post.title}』`)
            continue;
        }
        addPostToDownloadList(dlQueue, post)
    }
    const profileJson = await fetchData(profileAPIUrl)
    const profile = extractProfileData(profileJson);
    addProfileToDownloadList(dlQueue, profile);

    const plansJson = await fetchData(plansAPIUrl);
    const plans = extractPlansData(plansJson['body']);
    addPlansToDownloadList(dlQueue, plans);


    console.log("========");
    console.log(dlQueue);
    const res = await sendMessage('clickStart', dlQueue).catch(console.error);
    console.log(res);
    console.log("========")
}


async function fetchData(url: string) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Host': 'api.fanbox.cc',
                'Origin': 'https://www.fanbox.cc',
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to fetch. Status: ${response.status}`);
            return;
        }
        return await response.json(); // JSONの場合
    } catch (error) {
        console.error("Error during fetch:", error);
        throw error;
    }
}

function addPlansToDownloadList(dlQueue: DownloadQueue, plans: Plan[]) {
    const dirname = "plans"
    // プランの内容のテキストを追加
    for (const plan of plans) {
        const filename = `${plan.title}.txt`
        const text = `${plan.title}\n${plan.description}\n￥${plan.fee}`
        dlQueue.push({ dirname, filename, text })
    }
    // プランの画像を追加
    for (const plan of plans) {
        const filename = `${plan.title}.jpeg`;
        dlQueue.push({ dirname, filename, url: plan.coverImageUrl})
    }
}

// profileItem の要素のtypeがimage以外にあるか調査
function addProfileToDownloadList(dlQueue: DownloadQueue, profile: Profile) {
    const dirname = "profile";
    // ヘッダー画像が設定されているときだけ
    if (profile.coverImageUrl) {
        dlQueue.push({ dirname, filename: "header.jpeg", url: profile.coverImageUrl });
    }
    // アイコンが設定されてない場合だけ保存
    if (profile.user.iconUrl) {
        dlQueue.push({ dirname, filename: "icon.jpeg", url: profile.user.iconUrl });
    }
    // ポートフォリオ画像の場合はリンク保存する。
    for (const [i, item] of profile.profileItems.entries() ) {
        if (isImageProfileItem(item)) {
            dlQueue.push({ dirname, filename: `portfolio${i}.jpeg`, url: item.imageUrl })
        }
    }
    // ポートフォリオ動画URLと自己紹介文テキストファイルにまとめてダウンロードする
    let videoUrls = [];
    for (const item of profile.profileItems) {
        if (isVideoProfileItem(item)) {
            videoUrls.push(formatVideoUrl(item.serviceProvider, item.videoId));
        }
    }
    dlQueue.push({ dirname, filename: "profile.txt", text: formatProfileText(profile, videoUrls) });
}

function formatVideoUrl (site: string, videoId: string) {
    switch (site) {
        case "youtube":
            return `https://www.youtube.com/watch?v=${videoId}`;
        case "vimeo":
            return `https://vimeo.com/203934260${videoId}`;
        case "soundcloud":
            return `https://soundcloud.com/${videoId}`;
        default:
            console.error("対応してないサイトのURLです");
            return "youtube.com/";
    }
}

function formatProfileText(profile: Profile, videoUrls: string[]): string {
    // 自己紹介文があれば表示
    const description = profile.description;
    const descriptionResult = description !== "" ? `\n[Description]\n${description}\n` : "";
    // 自己紹介の外部リンクが貼ってある場合URLを表示
    const sns = profile.profileLinks.join("\n"); // 配列が[]なら\nは追加されない
    const snsResult = sns ? `\n[SNS]\n${sns}\n` : "";
    // ポートフォリオに動画リンクが貼ってある場合URLを表示
    const itemUrl = videoUrls.join("\n")
    const itemResult = itemUrl ? `[Portfolio]\n${itemUrl}` : "";
    // 名前、自己紹介文、リンク
    return `${profile.user.name}(@${profile.creatorId})${descriptionResult}${snsResult}${itemResult}`;
}

// 投稿の添付ファイルと本文をダウンロードするリストに追加。投稿のタイプは5種類あり、それぞれjsonが違うので場合わけ
function addPostToDownloadList(dlQueue: DownloadQueue, post: Post) {
    const dirname = `${toTimestamp(post.publishedDatetime)}${post.title.trim()}`;
    const type = post.type;
    const body = post.body;

    // 投稿のヘッダー画像があれば保存
    if (post.coverImageUrl) {
        dlQueue.push({ dirname, filename: "cover.jpeg", url: post.coverImageUrl });
    }

    const filename = "post.txt"
    const url = `https://www.fanbox.cc/@${post.creatorId}/posts/${post.id}`
    const tag = post.tags.map(item => `#${item}`).join(" "); // ["a", "b", "c"] => "#a #b #c"
    let text = `${url}\n${post.title}\n${formatDateToYMDHM(post.publishedDatetime)} ￥${post.feeRequired}\n${tag}\n`;

    if (isTextBody(type, body)) { // ユーザー型定義ガード
        // テキスト投稿
        text += body.text;
        dlQueue.push({ dirname, filename, text })
    } else if (isVideoBody(type, body)) {
        // ビデオ・音楽投稿
        text += formatVideoData(body);
        dlQueue.push({ dirname, filename, text})
    } else if (isImageBody(type, body)) {
        // 画像投稿
        // └--画像一覧
        body.images.forEach(image => {
            dlQueue.push({ dirname, filename: `image.${image.extension}`, url: image.originalUrl });
        });
        // └--投稿本文
        text += body.text;
        dlQueue.push({ dirname, filename, text});
    } else if (isFileBody(type, body)) {
        // ファイル投稿
        // └--ファイル一覧
        body.files.forEach((file) => {
            dlQueue.push({ dirname, filename: `${file.name}.${file.extension}`, url: file.url });
        });
        // └--投稿本文
        text += body.text
        dlQueue.push({ dirname, filename, text });
    } else if (isArticleBody(type, body)) {
        // ブログ投稿
        // └--画像一覧
        Object.values(body.imageMap).forEach(image => {
            dlQueue.push({ dirname, filename: `image.${image.extension}`, url: image.originalUrl });
        });
        // └--ファイル一覧
        Object.values(body.fileMap).forEach(file => {
            dlQueue.push({ dirname, filename: `${file.name}.${file.extension}`, url: file.url });
        });
        // └--投稿本文
        text += formatArticleText(body)
        dlQueue.push({ dirname, filename, text });
    }
}



function toTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${m}-${d}-`
}

function formatDateToYMDHM(dateString: string): string {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    const hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${y}年${m}月${d}日 ${hour}:${minute}`;
}

function extractPostData(json: any): Post {
    const { id, title, feeRequired, tags, isRestricted, creatorId, type, coverImageUrl, body, imageForShare, publishedDatetime } = json.body;
    return {id, title, feeRequired, tags, isRestricted, creatorId, type, coverImageUrl, body, imageForShare, publishedDatetime};
}

function extractPostId(json: any): string[] {
    return json.body.map((post: any) => post.id)
}

function extractAllPageUrls(json: { body: string[] }): string[] {
    return json.body;
}

function extractProfileData(json: any): Profile {
    return {
        user: json.body.user,
        creatorId: json.body.creatorId,
        description: json.body.description,
        profileLinks: json.body.profileLinks,
        profileItems: json.body.profileItems,
        coverImageUrl: json.body.coverImageUrl,
        hasBoothShop: json.body.hasBoothShop,
    }
}

function extractPlansData(json: any): Plan[] {
    // any型だとmapがないからArray型であることを絞り込む
    // JSONから送られてくるキーを選別してPlanにする関数なのに、送られてくるデータの型を作るのは二重に大変だからこうする
    if (!Array.isArray(json)) {
        console.error("Invalid data: Expected an array.");
        return [];
    }
    return json.map((plan: any): Plan => ({
        title: plan.title, // デフォルト値を設定
        fee: plan.fee,
        description: plan.description,
        coverImageUrl: plan.coverImageUrl || "https://picsum.photos/200/300", // カバー画像が指定されてないときはサンプル画像をDL
    }));
}

// ブログ投稿のテキスト本文を.txt形式にフォーマット
const formatArticleText = (body: ArticleBody) => {
    return body.blocks.map(block => {
        switch (block.type) {
            case "p":
                return `${block.text}\n`;
            case "image":
                return `[image]\n`;
            case "file":
                return `[${body.fileMap[block.fileId].name}]\n`;
            case "url_embed":
                return `[${body.urlEmbedMap[block.urlEmbedId].html}]\n`;
            default:
                return "\n";
        }
    }).join(""); // 配列の各要素を連結してHTML文字列を作成
};

// 動画・音楽投稿のテキスト本文を.txt形式にフォーマット
function formatVideoData(body: VideoBody): string {
    const videoUrl = body.video.videoId;
    const text = body.text;
    return `${videoUrl}\n${text}`;
}

async function generateAllPostUrls(apiUrl: string) {
    const allPageUrlsJson = await fetchData(apiUrl);
    const allPageUrls = extractAllPageUrls(allPageUrlsJson)

    // ページネーション情報から各投稿のURLを取得する
    let postUrls = [];
    for (const pageUrl of allPageUrls) {
        const posts = await fetchData(pageUrl);
        const ids = extractPostId(posts)
        postUrls.push(...generatePostUrls(ids))
    }
    return postUrls;
}

// urlからuserIDを抽出
function getUserID(url: string): string {
    const parsedUrl = new URL(url);
    const paths = parsedUrl.pathname.split("/");
    const atPath = paths.find(path => path.startsWith("@"));

    // URLに含まれるユーザーIDは2パターン
    let userID;
    if (atPath != undefined) {
        // fanbox.cc/@XXX
        userID = atPath.replace('@', "") // 下のパターンに合わせて@を削除
    } else {
        // XXX.fanbox.cc
        userID = parsedUrl.host.split(".")[0];
    }
    return userID;
}

// UserIDから、プロフィール、投稿一覧のページネーション、プラン一覧、物販一覧のAPIを作成
function generateUserUrls (url: string): { profileAPIUrl: string, allPagesAPIUrl: string, plansAPIUrl: string, shopAPIUrl: string} {
    const userID = getUserID(url);
    const fanboxBaseUrl = "https://api.fanbox.cc";
    const pixivBaseUrl = "https://api.booth.pm";

    //  https://api.fanbox.cc/creator.get?creatorId=kanashii-sadame
    //  https://api.fanbox.cc/creator.get?creatorId=kanashii-sadame

    return {
        profileAPIUrl: `${fanboxBaseUrl}/creator.get?creatorId=${userID}`,
        allPagesAPIUrl: `${fanboxBaseUrl}/post.paginateCreator?creatorId=${userID}`,
        plansAPIUrl: `${fanboxBaseUrl}/plan.listCreator?creatorId=${userID}`,
        shopAPIUrl: `${pixivBaseUrl}/pixiv/shops/show.json?pixiv_user_id=${userID}`,
    }
}

function generatePostUrls(ids: string[]): string[] {
    return ids.map(id => `https://api.fanbox.cc/post.info?postId=${id}`)
}

// ユーザー型ガード
function isArticleBody(type: string, body: Post['body']): body is ArticleBody {
    return type == "article";
}

function isTextBody(type: string, body: Post['body']): body is TextBody {
    return type == "text";
}

function isImageBody(type: string, body: Post['body']): body is ImageBody {
    return type == "image";
}

function isVideoBody(type: string, body: Post['body']): body is VideoBody {
    return type == "video";
}

function isFileBody(type: string, body: Post['body']): body is FileBody {
    return type == "file";
}

function isImageProfileItem(item: ImageProfileItem | VideoProfileItem): item is ImageProfileItem {
    return item.type === "image"; // "image" の場合は ImageProfileItem と判定
}

function isVideoProfileItem(item: ImageProfileItem | VideoProfileItem): item is VideoProfileItem {
    return item.type === "video"; // "video" の場合は VideoProfileItem と判定
}
