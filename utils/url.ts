// urlからuserIDを抽出
export function getUserID(url: string): string {
    const parsedUrl = new URL(url);
    const paths = parsedUrl.pathname.split("/");
    const atPath = paths.find(path => path.startsWith("@"));

    // URLに含まれるユーザーIDは2パターン
    let userID;
    if (atPath != undefined) {
        // パスにつくパターン(fanbox.cc/@xxx)
        userID = atPath.replace('@', "") // 下のパターンに合わせて@を削除
    } else {
        // サブドメインにつくパターン(xxx.fanbox.cc)
        userID = parsedUrl.host.split(".")[0];
    }
    return userID;
}

// この処理が肝。普通のサイトでいうところの isLogin に匹敵する。よって毎回これで証券分岐することになるが、仕方がないこと。
export function isCreatorPage(url: string): boolean {
    const userID = getUserID(url);
    // クリエイターページにいないと、www.fanbox.cc から始まるURLになるから、userIDは"www"になる
    return userID !== "www";
}

// UserIDから、プロフィール、投稿一覧のページネーション、プラン一覧、物販一覧のAPIを作成
export function generateUserUrls (url: string): { profileAPIUrl: string, allPagesAPIUrl: string, plansAPIUrl: string, shopAPIUrl: string} {
    const userID = getUserID(url);
    const fanboxBaseUrl = "https://api.fanbox.cc";
    const pixivBaseUrl = "https://api.booth.pm";

    return {
        profileAPIUrl: `${fanboxBaseUrl}/creator.get?creatorId=${userID}`,
        allPagesAPIUrl: `${fanboxBaseUrl}/post.paginateCreator?creatorId=${userID}`,
        plansAPIUrl: `${fanboxBaseUrl}/plan.listCreator?creatorId=${userID}`,
        shopAPIUrl: `${pixivBaseUrl}/pixiv/shops/show.json?pixiv_user_id=${userID}`,
    }
}

// APIをフェッチしてJSONを返す
export async function fetchJson(url: string) {
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
