'use strict';

import 'regenerator-runtime/runtime'; // for async/await babel transpiling
import browser from 'webextension-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Popup from './Popup';

async function getTab() {
  // get active tab
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  });
  console.log(tabs);
}

getTab();

// browser.runtime.sendMessage({ data: 'hello' });

ReactDOM.render(<Popup />, document.getElementById('root'));
