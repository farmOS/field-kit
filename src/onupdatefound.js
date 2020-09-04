import { version } from '../package.json';

const html = (tag, text) => (strings) => {
  const el = document.createElement(tag);
  if (text) {
    const tNode = document.createTextNode(text);
    el.appendChild(tNode);
  }
  const str = strings[0].replace(/\s/g, ' ');
  el.setAttribute('style', str);
  return el;
};

const popup = (confirm) => {
  const banner = html('div')`
    position: fixed;
    display: flex;
    justify-content: start;
    bottom: 0;
    left: 0;
    z-index: 1000;
    background-color: white;
    width: 100%;
    min-height: 3rem;
    box-shadow: 0px -1px 3px rgba(0, 0, 0, 0.125);
    border-top: 1px solid rgba(0,0,0,0.125);
    padding: 0.75rem;
  `;

  const message = html('div', `Version ${version} of Field Kit is now available.`)`
    flex: 0 0 auto%;
  `;
  const installBtn = html('button', 'Install')`
    flex: 0 0 auto;
    margin-left: 1.5rem;
    background-color: var(--cyan);
    color: white;
    font-weight: bold;
    border: none;
    padding: 0.375rem 0.75rem;
    box-shadow: -1px -2px 3px rgba(0, 0, 0, 0.125);
    border: 1px solid rgba(0,0,0,0.125);
    border-radius: 2px;
  `;
  const dismissBtn = html('button', 'Dismiss')`
    flex: 0 0 auto;
    margin-left: 1.5rem;
    background-color: white;
    color: #555;
    font-weight: bold;
    border: none;
    padding: 0.375rem 0.75rem;
    box-shadow: -1px -2px 3px rgba(0, 0, 0, 0.125);
    border: 1px solid rgba(0,0,0,0.125);
    border-radius: 2px;
  `;
  banner.appendChild(message);
  banner.appendChild(dismissBtn);
  banner.appendChild(installBtn);

  document.body.appendChild(banner);

  dismissBtn.addEventListener('click', () => {
    document.body.removeChild(banner);
  });

  installBtn.addEventListener('click', () => {
    confirm();
    window.location.reload();
    document.body.removeChild(banner);
  });
};

const onupdatefound = registration => () => {
  registration.installing.addEventListener('statechange', (e) => {
    if (e.target.state === 'installed') {
      popup(() => registration.waiting.postMessage({ type: 'SKIP_WAITING' }));
    }
  });
};

export default onupdatefound;
