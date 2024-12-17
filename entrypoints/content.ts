export default defineContentScript({
  matches: ['*://*.fanbox.css/*'],
  main() {

  },
});

type UserInfo = {
  name: string,
  icon: string,
  description: string,
}

type Plan = {
  title: string,
  image: string,
  description: string,
  monthlyFee: string,
}

type Post = {
  title: string,
  metadata: string,
  thumbnail?: string,
  content: string,
  hashtags: (string | null)[],
}
// https://www.fanbox.cc/{userName}/posts の要素
const postElems = document.querySelectorAll<HTMLAnchorElement>('[class*="CardPostItem__Wrapper"]');

function isLastPage(): boolean {
  const pageLinkElems = Array.from(document.querySelectorAll<HTMLAnchorElement>('[class*="Pagination__DesktopWrapper"] > [class*="Pagination__Wrapper"] > a '))
  // 一覧が1ページしかないときページネーションの子要素にaタグがない
  if (pageLinkElems.length == 0) {
    return true
  }
  // 次ページリンクがあるとき <pixiv-icon>タグがある
  return pageLinkElems[pageLinkElems.length - 1].children[0].tagName.toLowerCase() !== "pixiv-icon"
}
function getPostUrls(): string[] {
  const postElems = document.querySelectorAll<HTMLAnchorElement>('[class*="CardPostItem__Wrapper"]');
  let postUrls = [];
  for ( let postElem of postElems) {
    const url = postElem.href;

    if (url.endsWith("/plans")) {
      console.log("プランに加入していないためスキップ");
      break;
    }
    postUrls.push(postElem.href);
  }
  return postUrls;
}
function getUserInfo(): UserInfo | undefined {
  const userIconElem =  document.querySelector<HTMLElement>('[class*="CreatorHeader__IsNotMobile"] [class*="UserIcon__Icon"]');
  const userNameElem =  document.querySelector<HTMLElement>('[class*="CreatorHeader__IsNotMobile"] [class*="UserNameText"]');
  const userDescriptionElem = document.querySelector<HTMLElement>('[class*="TwoColumnLayout__MainColumn"] [class*="Description"]');

  if (!userIconElem || !userNameElem || !userDescriptionElem) {
    console.error("ユーザー情報を取得しようとしましたが、 アイコン、ユーザー名、自己紹介文　のいずれかのDOMが存在しませんでした");
    return undefined;
  }
  const name = userIconElem.textContent;
  const icon = userIconElem.style.backgroundImage;
  const description = userDescriptionElem.textContent;

  if (!name || !description) {
    console.error("ユーザー情報を取得しようとしましたが、 ユーザー名、自己紹介文　のいずれかのtextContentが保存できませんでした");
    return undefined;
  }

  return {name, icon, description};
}

function getPlans(): Plan[] | undefined {
  const planListElems = document.querySelectorAll('[class*="PlanItem__Wrapper"]')
  let plans: Plan[] = [];

  for ( const planElem of planListElems) {
    // 要素を取得
    const planImageElem = planElem.querySelector<HTMLDivElement>('[class*="PlanItem__CoverImage"]');
    const planTitleElem = document.querySelector<HTMLDivElement>('[class*="PlanItem__Title"]');
    const planDescriptionElem = document.querySelector<HTMLDivElement>('[class*="Description__Text"]');
    const planMonthlyFeeElem = document.querySelector<HTMLDivElement>('[class*="PlanItem__FeePerMonth"] > div[class*="PlanItem__Fee"]');

    if ( !planImageElem || !planTitleElem || !planDescriptionElem || !planMonthlyFeeElem) {
      console.error("プラン情報を取得しようとしましたが、画像、プラン名、説明文、月額料金のいずれかのDOMが見つかりませんでした");
      return undefined;
    }

    // 要素から情報を取得
    const image = planImageElem.style.backgroundImage;
    const title = planTitleElem.textContent;
    const description = planDescriptionElem.textContent;
    const monthlyFee = planMonthlyFeeElem.textContent;

    if (!title || !description || !monthlyFee) {
      console.error("プラン情報を取得しようとしましたが、画像、プラン名、説明文、月額料金のいずれかのtextContentが見つかりませんでした");
      return undefined;
    }
    plans.push({title, image, description, monthlyFee})
  }

  return plans
}

const pageLinks = document.querySelectorAll<HTMLAnchorElement>('[class*="Pagination__DesktopWrapper"] > [class*="Pagination__Wrapper"] > a ')
// 指定したURLの投稿を取得
function getPosts(url: string): Post | undefined {
  const titleElem = document.querySelector<HTMLHeadingElement>('[class*="PostTitle"]');
  const metadataElem =  document.querySelector<HTMLDivElement>('[class*="PostHeadBotto"]');
  const thumbnailElem =  document.querySelector<HTMLImageElement>('[class*="PostImage__Image"] > img');
  const contentElem =  document.querySelector<HTMLDivElement>('[class*="Body__PostBodyText"]');
  const hashtagElems = document.querySelectorAll('[class*="Tag__Text"]');

  if (!titleElem || !metadataElem || !thumbnailElem || !contentElem) {
    console.error("詳細ページ内で タイトル、投稿情報、画像、テキスト のいずれかが見つかりません");
    return undefined;
  }

  const title = titleElem.textContent;
  const metadata = metadataElem.textContent;
  const thumbnail = thumbnailElem.src;
  const content = contentElem.textContent;

  const hashtags = [];
  if (hashtagElems.length >= 0) {
    for (const hashtagElem of hashtagElems) {
      hashtags.push(hashtagElem.textContent);
    }
  }

  if (!title || !metadata || !content) {
    console.error("詳細ページのDOMで タイトル、投稿情報、テキスト のいずれかのtextContentが見つかりません");
    return undefined;
  }
  return {title, metadata, thumbnail, content, hashtags}
}
