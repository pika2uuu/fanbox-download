// import {logger} from "@/utils/logger.ts";
import {Profile, Plan, Post, ArticleBody, ImageBody, VideoBody, ImageProfileItem, VideoProfileItem} from "@/utils/type.ts";
import { sendMessage } from '../utils/messaging'
import { generateUserUrls, fetchJson } from "@/utils/url.ts";

export async function download(url: string): Promise<boolean> {
    // let ignorePaywall = true; // 支援金額が足りないとき、タイトルなど一部のデータを取得するかを尋ねる
    // let ignoreFreePlan = true;
    const { profileAPIUrl, allPagesAPIUrl, plansAPIUrl, shopAPIUrl } = generateUserUrls(url);

    // 保存先のトップディレクトリ名をユーザーIDにする。pushXXX 関数内で個々に定義すればいいけど、プラン一覧のAPIにユーザー名がなかったから
    // 仕方がないのでここで定義している。
    const username = getUserID(url);
    const postUrls = await generateAllPostUrls(allPagesAPIUrl);

    if (postUrls.length == 0) {
        console.warn("投稿されている記事が１つもないので終了します")
        return false;
    }

    // 現在は支援金額をみたしている投稿だけ表示している。
    for (const postUrl of postUrls) {
        const postJson = await fetchJson(postUrl);
        const post = extractPostData(postJson); // fetchでJSON取得直後に不要なキーを削除したPost型に変換
        // 支援金額た足りない場合、 isRestricted が true
        if (post.isRestricted) {
            console.warn(`支援金額が足りないためコンテンツを取得できませんでした。title:『${post.title}』`)
            continue;
        }
        await pushPostToDownloadQueue(post, username)
    }
    const profileJson = await fetchJson(profileAPIUrl)
    const profile = extractProfileData(profileJson);
    await pushProfileToDownloadQueue(profile, username);

    const plansJson = await fetchJson(plansAPIUrl);
    const plans = extractPlansData(plansJson['body']);
    await pushPlansToDownloadQueue(plans, username);

    return false;
}

async function pushPlansToDownloadQueue(plans: Plan[], username: string) {
    const dirname = "plans"
    // プランの内容のテキストを追加
    for (const plan of plans) {
        const filename = `${plan.title}.txt`
        const text = `${plan.title}\n${plan.description}\n￥${plan.fee}`
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, filename),  text });
    }
    // プランの画像を追加
    for (const plan of plans) {
        const filename = `${plan.title}.jpeg`;
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, filename), url: plan.coverImageUrl});
    }
}

// profileItem の要素のtypeがimage以外にあるか調査
async function pushProfileToDownloadQueue(profile: Profile, username: string) {
    const dirname = "profile";
    // ヘッダー画像が設定されているときだけ
    if (profile.coverImageUrl) {
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "header.jpeg"), url: profile.coverImageUrl });
    }
    // アイコンが設定されてない場合だけ保存
    if (profile.user.iconUrl) {
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "icon.jpeg"), url: profile.user.iconUrl });
    }
    // ポートフォリオ画像の場合はリンク保存する。
    for (const [i, item] of profile.profileItems.entries() ) {
        if (isImageProfileItem(item)) {
            await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, `portfolio${i}.jpeg`), url: item.imageUrl })
        }
    }
    // ポートフォリオ動画URLと自己紹介文テキストファイルにまとめてダウンロードする
    let videoUrls = [];
    for (const item of profile.profileItems) {
        if (isVideoProfileItem(item)) {
            videoUrls.push(formatVideoUrl(item.serviceProvider, item.videoId));
        }
    }
    await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "profile.txt"), text: formatProfileText(profile, videoUrls) })
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

// 投稿の添付ファイルと本文をダウンロードするリストに追加。投稿は5種類あるので本文のbodyは場合わけ
async function pushPostToDownloadQueue( post: Post, username: string) {
    const dirname = `${toTimestamp(post.publishedDatetime)}${post.title.trim()}`;
    const type = post.type;
    const body = post.body;

    // 投稿のヘッダー画像があれば保存
    if (post.coverImageUrl) {
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "cover.jpeg"), url: post.coverImageUrl });
    }

    // URL、タグ、タイトル、日付、金額 は投稿の種類によらず共通なので text に事前に格納する
    const url = `https://www.fanbox.cc/@${post.creatorId}/posts/${post.id}`
    const tag = post.tags.map(item => `#${item}`).join(" "); // ["a", "b", "c"] => "#a #b #c"
    let text = `${url}\n${post.title}\n${formatDateToYMDHM(post.publishedDatetime)} ￥${post.feeRequired}\n${tag}\n`;

    // 投稿のタイプによってjsonのbodyキーの値が違うので場合わけしてtextに追記する
    if (isTextBody(type, body)) { // ユーザー型定義ガード
        // テキスト投稿
        text += body.text;
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "body.txt"), text });
    } else if (isVideoBody(type, body)) {
        // ビデオ・音楽投稿
        text += formatVideoData(body);
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "body.txt"), text});
    } else if (isImageBody(type, body)) {
        // 画像投稿
        // └--画像一覧
        for (const image of body.images) {
            await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, `image.${image.extension}`), url: image.originalUrl });
        }
        // └--投稿本文
        text += body.text;
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "body.txt"), text});
    } else if (isFileBody(type, body)) {
        // ファイル投稿
        // └--ファイル一覧
        for (const file of body.files) {
            await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, `${file.name}.${file.extension}`), url: file.url });
        }
        // └--投稿本文
        text += body.text
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "body.txt"), text });
    } else if (isArticleBody(type, body)) {
        // ブログ投稿
        // └--画像一覧
        for (const image of Object.values(body.imageMap)) {
            await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, `image.${image.extension}`), url: image.originalUrl });
        }
        // └--ファイル一覧
        for (const file of Object.values(body.fileMap)) {
            await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, `${file.name}.${file.extension}`), url: file.url });
        }
        // └--投稿本文
        text += formatArticleText(body)
        await sendMessage("pushDownloadQueue", { targetFilename: toFullPath(username, dirname, "body.txt"), text });
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

// パスに / があったら自動的にディレクトリが作られるので、ディレクトリ名とファイル名から / を取り除く。タイトルに日付を書いてる時に / がついてることがある
function toFullPath(username: string, dirname: string, filename: string): string {

    const dir = dirname.replaceAll("/", "-");
    const file = filename.replaceAll("/", "-");
    return `${username}/${dir}/${file}`;
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

export function extractProfileData(json: any): Profile {
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
    const allPageUrlsJson = await fetchJson(apiUrl);
    const allPageUrls = extractAllPageUrls(allPageUrlsJson)

    // ページネーション情報から各投稿のURLを取得する
    let postUrls = [];
    for (const pageUrl of allPageUrls) {
        const posts = await fetchJson(pageUrl);
        const ids = extractPostId(posts)
        postUrls.push(...generatePostUrls(ids))
    }
    return postUrls;
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
    return item.type === "image";
}

function isVideoProfileItem(item: ImageProfileItem | VideoProfileItem): item is VideoProfileItem {
    return item.type === "video";
}
