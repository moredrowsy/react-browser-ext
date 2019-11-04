'use strict';

import 'regenerator-runtime/runtime'; // for async/await babel transpiling
import browser from 'webextension-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Options from './Options';

ReactDOM.render(<Options />, document.getElementById('root'));
