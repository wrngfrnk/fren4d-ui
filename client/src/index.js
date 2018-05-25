import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App.js';
import './styles/index.css';

// TODO: Use a Sass loader w/ webpack to directly deal with the sass files
// TODO: Saving/loading to JSON
// TODO: Integrate with robot!

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
);