import browser from 'webextension-polyfill';

import React, { Component } from 'react';
import ReactLogo from '../assets/logo.svg';
import './Popup.css';

class Popup extends Component {
  state = {
    data: 'Hello from Popup.js',
    tab: null,
    port: null
  };

  async componentDidMount() {
    // get port to background
    const port = await browser.runtime.connect({ name: 'popup' });
    this.setState({ port: port });

    // get active tab
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true
    });
    this.setState({ tab: tabs[0] });

    // send port message
    this.state.port.postMessage({
      text: 'Popup posting port message',
      tab: this.state.tab
    });

    // listen for port messages
    this.state.port.onMessage.addListener(msg => {
      console.log('Popup listning to port message:', msg);
    });

    // send message to content_scripts
    browser.tabs
      .sendMessage(this.state.tab.id, {
        from: 'popup',
        subject: 'DOMInfo'
      })
      .then(response => {
        console.log('Popup listening to onMessage response:', response);
      })
      .catch(e =>
        console.log(`Popup send message to content script failed: ${e.message}`)
      );

    // listen for one-time message
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Popup listening to onMessage:', message);
    });

    const code = await this.getContentPage();
    console.log('Scraping content page from Popup componentDidMount()', code);
  }

  // get content page's html code via content page injection
  getContentPage = () => {
    return new Promise(async (resolve, reject) => {
      if (this.state.tab) {
        // we have to convert the function to a string
        const scriptToExec = `(${this.scrapePage})()`;

        // run the script in the context of the tab
        browser.tabs
          .executeScript(this.state.tab.id, { code: scriptToExec })
          .then(scrapedHtml => {
            if (scrapedHtml) resolve(scrapedHtml[0]);
            else reject(`Could not scrape content page`);
          })
          .catch(e => console.log(`Can not execute script: ${e.message}`));
      } else reject('Can not get content page of undefined tab');
    });
  };

  // return entire document's html code
  scrapePage = () => {
    return document.documentElement.outerHTML; // return html code
  };

  getStateData = () => {
    return this.state.data;
  };

  render() {
    return (
      <div className='Popup' style={{ width: 100 }}>
        <ReactLogo width='40px' height='40px' />
        <h4>{this.getStateData()}</h4>
      </div>
    );
  }
}

export default Popup;
