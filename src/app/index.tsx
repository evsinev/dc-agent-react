import ReactDOM from 'react-dom/client';
import App from './app';

document.body.className = 'awsui-dark-mode';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
