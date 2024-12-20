import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  runner: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    startUrls: ["https://www.fanbox.cc/"]
  },
    manifest: {
      host_permissions: ["https://www.fanbox.cc/"],
      permissions: [
        "declarativeNetRequest",
        "declarativeNetRequestWithHostAccess",
      ],
      declarative_net_request: {
        rule_resources: [
          {
            id: 'fanbox',
            enabled: true,
            path: 'rules/fanbox.json',
          }
        ]
      }
    },
});
