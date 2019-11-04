'use strict';

import browser from 'webextension-polyfill';

console.log('content_scripts.js loaded');

// Listen for one-time messsage
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.from === 'popup' && message.subject === 'DOMInfo') {
    console.log('Content script listening to onMessage:', message);
    return Promise.resolve('Sending response from content script!');
  }
});
