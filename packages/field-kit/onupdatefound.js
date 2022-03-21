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
    background-color: var(--white);
    width: 100%;
    min-height: 3rem;
    box-shadow: var(--shadow-inverse);
    border-top: 1px solid rgba(0,0,0,0.125);
    padding: 0.75rem;
  `;

  const message = html('div', 'A new version of Field Kit is available.')`
    flex: 0 0 auto%;
  `;
  const installBtn = html('button', 'Install')`
    flex: 0 0 auto;
    margin-left: 1.5rem;
    background-color: var(--blue);
    color: var(--white);
    font-weight: bold;
    border: none;
    padding: 0.375rem 0.75rem;
    box-shadow: var(--shadow-inverse);
    border: 1px solid rgba(0,0,0,0.125);
    border-radius: 2px;
  `;
  const dismissBtn = html('button', 'Dismiss')`
    flex: 0 0 auto;
    margin-left: 1.5rem;
    background-color: var(--white);
    color: var(--text);
    font-weight: bold;
    border: none;
    padding: 0.375rem 0.75rem;
    box-shadow: var(--shadow-inverse);
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

  return function cancel() {
    document.body.removeChild(banner);
  };
};

const onupdatefound = registration => () => {
  registration.installing.addEventListener('statechange', (e) => {
    if (e.target.state === 'installed') {
      const confirm = () => registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      const cancel = popup(confirm);
      registration.waiting.addEventListener('statechange', (_e) => {
        if (_e.target.state === 'activating') {
          cancel();
        }
      });
    }
  });
};

export default onupdatefound;
