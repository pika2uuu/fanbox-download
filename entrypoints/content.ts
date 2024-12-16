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
// 共通
// https://www.fanbox.cc/{userName} の要素
const planImageElems = document.querySelectorAll('[class*="PlanItem__CoverImage"]');
const planTitleElems = document.querySelectorAll('[class*="PlanItem__Title"]');
const planDescriptionElems = document.querySelectorAll('[class*="Description__Text"]');
const planMonthlyFeeElems = document.querySelectorAll<HTMLDivElement>('[class*="PlanItem__FeePerMonth"] > div[class*="PlanItem__Fee"]');
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

const pageLinks = document.querySelectorAll<HTMLAnchorElement>('[class*="Pagination__DesktopWrapper"] > [class*="Pagination__Wrapper"] > a ')
