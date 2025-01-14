export type DbConfig = {
  danEdwardsCreative: 'dan-edwards-creative-analytics' & {
    pageViews: 'page-views'
    linkClicks: 'link-clicks'
    preSaves: 'pre-saves'
    emailSubscriptions: 'email-subscriptions'
  }
  danEdwardsDeveloper: 'dan-edwards-developer-analytics' & {
    pageViews: 'page-views'
    linkClicks: 'link-clicks'
    preSaves: 'pre-saves'
    emailSubscriptions: 'email-subscriptions'
  }
  arrayOfSunshine: 'array-of-sunshine-analytics' & {
    pageViews: 'page-views'
    linkClicks: 'link-clicks'
    emailSubscriptions: 'email-subscriptions'
  }
  danDigresses: 'dan-digresses' & {
    pageViews: 'page-views'
    emailSubscriptions: 'email-subscriptions'
  }
}
