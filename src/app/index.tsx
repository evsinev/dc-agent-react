import ReactDOM from 'react-dom/client';
import App from './app';

document.body.className = 'awsui-dark-mode';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
} else {
  console.error('No root element found!');
}
