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
