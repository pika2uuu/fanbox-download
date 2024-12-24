import { sendMessage1 } from '../utils/messaging'

export default defineContentScript({
  matches: ['*://*.fanbox.cc/*'],
  async main() {
    console.log("content")
  }
});