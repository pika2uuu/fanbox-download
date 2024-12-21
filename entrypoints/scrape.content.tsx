// import {logger} from "@/utils/logger.ts";
import {CreatorData, Plan, PageUrl, Post, Block, ArticleBody, DlList, ImageBody, VideoBody} from "@/utils/type.ts";

export default defineContentScript({
    matches: ['*://www.fanbox.cc/@*', '*://*.fanbox.cc/*'],
      async main() {

        let ignorePaywall = true; // 支援金額が足りないとき、タイトルなど一部のデータを取得するかを尋ねる
        let ignoreFreePlan = true;
        const dlList = {
          items: [],
          postCount: 0,
          fileCount: 0
        };

        const url = ""
        const userId = getUserID(url);
        const { profileAPIUrl, allPagesAPIUrl, plansAPIUrl, shopAPIUrl } = generateUserUrls(userId);
        const allPageUrlsJson = await fetchData(allPagesAPIUrl);
        const allPageUrls = extractAllPageUrls(allPageUrlsJson)

        let postUrls = [];
        for (const pageUrl of allPageUrls) {
          const posts = await fetchData(pageUrl);
          const ids = extractPostId(posts)
          postUrls.push(...generatePostUrls(ids))
        }

        if (postUrls.length == 0) {
          console.log("投稿されている記事が１つもありません")
          return;
        }

        for (const postUrl of postUrls) {
          dlList.postCount++;
          const postJson = await fetchData(postUrl);
          const post = extractPostData(postJson); // fetchでJSON取得直後に不要なキーを削除したPost型に変換
          if (post.body === null ) {
            console.log("取得できませんでした。おそらく支援金額が足りません")
            console.log(post)
            return;
          }
          // console.log(post);
          // ファンボックスの投稿には5種類ありそのうち3つにダウンロード可能なファイルが含まれる(article, image, file)
          // 投稿の種類に応じてダウンロードすべきリンクが異なるので場合わけを行う。

          // ユーザー定義型を行なって型を特化させている
          if (isArticleBody(post.type, post.body)) {
            const imageMap = post.body.imageMap;
            for (const [i, [id, image]] of Object.entries(imageMap).entries()) {
              console.log(post.publishedDatetime);
              const filename = `${toTimestamp(post.publishedDatetime)}${post.title}${i}.${image.extension}`;
              // console.log(filename)
              addUrl(dlList, image.originalUrl, filename);
            }

            const fileMap = post.body.fileMap;
            for (const [id, file] of Object.entries(fileMap)) {
              const filename = `${toTimestamp(post.publishedDatetime)}${post.title}${file.name}.${file.extension}`;
              addUrl(dlList, file.url, filename);
            }
          }  else if (isImageBody(post.type, post.body)) {
            const images = post.body.images;
            for (const [i, [id, image]] of Object.entries(images).entries()) {
              const filename = `${toTimestamp(post.publishedDatetime)}${post.title}.${image.extension}`;
              addUrl(dlList, image.originalUrl, filename);
            }
          } else if (isFileBody(post.type, post.body)) {
            const files = post.body.files;
            for (const [id, file] of Object.entries(files)) {
              const filename = `${toTimestamp(post.publishedDatetime)}${post.title}${file.name}.${file.extension}`;
              console.log("ファイル名",filename)
              addUrl(dlList, file.url, filename);
            }
          }
        }


        console.log("start");
        console.log("現在のページ", window.location.href);
        console.log(dlList);
        console.log("end")

        // const profileJson = await fetchData(profileAPIUrl);
        // const profile = extractProfileData(profileJson);
        // console.log(profile);
        //
        // const plansJson = await fetchData(plansAPIUrl);
        // const plans = extractPlansData(plansJson);
        // console.log(plans);
    },
});

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
  }
}

function toTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const mim = date.getMinutes();
  return `${y}${m}${d}${h}${mim}`
}

function extractPostData(json: any): Post {
  const { id, title, publishedDatetime, tags, isRestricted, type, coverImageUrl, body, excerpt, imageForShare } = json.body;

  return {
    id,
    title,
    publishedDatetime,
    tags,
    isRestricted,
    type,
    coverImageUrl,
    body,
    excerpt,
    imageForShare
  };
}

function extractPostId(json: any): string[] {
  return json.body.map((post: any) => post.id)
}

function extractAllPageUrls(json: { body: string[] }): string[] {
  return json.body;
}

function extractProfileData(json: any): CreatorData {
  return {
    user: json.body.user,
    creatorId: json.body.creatorId,
    description: json.body.description,
    profileLinks: json.body.profileLinks,
    profileItems: json.body.profileItems,
    coverImageUrl: json.body.coverImageUrl,
  }
}

// function extractPlansData(response: any): Plan[] {
//   // bodyフィールドを削除して直接配列を返す
//   return response.map((plan: any) => ({
//     title: plan.title,
//     fee: plan.fee,
//     description: plan.description,
//     coverImageUrl: plan.coverImageUrl,
//     user: plan.user
//   }));
// }

function extractPostIds(json: any): PageUrl[] {
  return json.body.map((url: any) => ({
    url,
  }));
}

const convertArticleBodyToHtml = (body: ArticleBody) => {
  return body.blocks.map(block => {
    switch (block.type) {
      case "p":
        return `<p>${block.text}</p>`;
      case "image":
        return `<img src="${body.imageMap[block.imageId].originalUrl}" alt="Image" />`;
      case "file":
        return `[${body.fileMap[block.fileId].url}]`;
      case "url_embed":
        return `[${body.urlEmbedMap[block.urlEmbedId].html}]`;
      default:
        return "";
    }
  }).join(""); // 配列の各要素を連結してHTML文字列を作成
};

function addUrl(dlList: DlList ,url: string, filename: string) {
  const dl = { url, filename };
  dlList.fileCount++;
  dlList.items.push(dl)
}

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

function generateUserUrls (userID: string): { profileAPIUrl: string, allPagesAPIUrl: string, plansAPIUrl: string, shopAPIUrl: string} {
    const fanboxBaseUrl = "https://api.fanbox.cc";
    const pixivBaseUrl = "https://api.booth.pm";

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

