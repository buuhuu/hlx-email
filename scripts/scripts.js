import { sampleRUM, waitForLCP } from './lib-franklin.js';
import { decorateMain, toMjml, init } from './functions.js';

window.hlx = window.hlx || {};
window.hlx.RUM_GENERATION = 'hlx-email'; // add your RUM generation information here

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  const main = doc.querySelector('main');
  decorateMain(main);
  await waitForLCP([]);

  const html = await toMjml(main);
  let frame = document.getElementById('__emailFrame');
  if (!frame) {
    frame = document.createElement('iframe');
    frame.srcdoc = html;
    frame.width = '100%';
    frame.height = '100%';
    frame.id = '__emailFrame';
    document.body.insertAdjacentElement('beforeend', frame);
  } else {
    frame.srcdoc = html;
  }

  if (document.querySelector('helix-sidekick')) {
    await import('../tools/sidekick/plugins.js');
  } else {
    document.addEventListener('helix-sidekick-ready', () => import('../tools/sidekick/plugins.js'), { once: true });
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(/* doc */) {
  sampleRUM('lazy');
}

async function loadPage() {
  init(window);
  await loadEager(document);
  await loadLazy(document);
}

loadPage();
