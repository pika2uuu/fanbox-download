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
// https://www.fanbox.cc/{userName}/posts の要素
const postElems = document.querySelectorAll<HTMLAnchorElement>('[class*="CardPostItem__Wrapper"]');
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

const postTitleElem = document.querySelector<HTMLHeadingElement>('[class*="PostTitle"]');
const postInfoElem =  document.querySelector<HTMLDivElement>('[class*="PostHeadBotto"]');
const postImageElem =  document.querySelector<HTMLImageElement>('[class*="PostImage__Image"] > img');
const postContentElem =  document.querySelector<HTMLDivElement>('[class*="Body__PostBodyText"]');
function getPlanInfo(): Plan[] | undefined {
  const planListElems = document.querySelectorAll('[class*="PlanItem__Wrapper"]')
  let planInfo: Plan[] = [];
  
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
    planInfo.push({title, image, description, monthlyFee})
  }

  return planInfo
}

const pageLinks = document.querySelectorAll<HTMLAnchorElement>('[class*="Pagination__DesktopWrapper"] > [class*="Pagination__Wrapper"] > a ')
