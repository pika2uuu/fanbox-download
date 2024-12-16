export default defineContentScript({
  matches: ['*://*.fanbox.css/*'],
  main() {

  },
});

// 共通
const userIconElem =  document.querySelector<HTMLElement>('[class*="CreatorHeader__IsNotMobile"] [class*="UserIcon__Icon"]');
const userProfileElem =  document.querySelector<HTMLElement>('[class*="CreatorHeader__IsNotMobile"] [class*="UserNameText"]');
// https://www.fanbox.cc/{userName} の要素
const userDescriptionElem = document.querySelectorAll<HTMLElement>('[class*="TwoColumnLayout__MainColumn"] [class*="Description"]');
const planImageElems = document.querySelectorAll('[class*="PlanItem__CoverImage"]');
const planTitleElems = document.querySelectorAll('[class*="PlanItem__Title"]');
const planDescriptionElems = document.querySelectorAll('[class*="Description__Text"]');
const planMonthlyFeeElems = document.querySelectorAll<HTMLDivElement>('[class*="PlanItem__FeePerMonth"] > div[class*="PlanItem__Fee"]');
// https://www.fanbox.cc/{userName}/posts の要素
const postElems = document.querySelectorAll<HTMLAnchorElement>('[class*="CardPostItem__Wrapper"]');

const postTitleElem = document.querySelector<HTMLHeadingElement>('[class*="PostTitle"]');
const postInfoElem =  document.querySelector<HTMLDivElement>('[class*="PostHeadBotto"]');
const postImageElem =  document.querySelector<HTMLImageElement>('[class*="PostImage__Image"] > img');
const postContentElem =  document.querySelector<HTMLDivElement>('[class*="Body__PostBodyText"]');

const pageLinks = document.querySelectorAll<HTMLAnchorElement>('[class*="Pagination__DesktopWrapper"] > [class*="Pagination__Wrapper"] > a ')
