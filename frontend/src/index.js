import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/design-system.css';
import App from './App.js';
import store from './components/redux/store.js';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
