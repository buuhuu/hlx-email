import {
  decorateBlocks,
  decorateIcons,
  decorateSections,
  decorateTemplateAndTheme,
  sampleRUM,
  waitForLCP,
} from './lib-franklin.js';

window.hlx.RUM_GENERATION = 'hlx-email'; // add your RUM generation information here

async function loadMjml(src = 'https://unpkg.com/mjml-browser/lib/index.js') {
  let mjmlScript$;
  if (!document.querySelector(`head > script[src="${src}"]`)) {
    mjmlScript$ = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.crossOrigin = true;
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    })
  } else {
    mjmlScript$ = Promise.resolve();
  }
  await mjmlScript$;
  return window.mjml;
}

async function loadBlock(block) {
  const status = block.getAttribute('data-block-status');
  const blockName = block.getAttribute('data-block-name');
  let decorator;
  if (status !== 'loading' && status !== 'loaded') {
    block.setAttribute('data-block-status', 'loading');
    try {
      const blockFolder = `blocks/${blockName}`;
      const blockModule = await import(`../${blockFolder}/${blockName}.js`);
      if (!blockModule.default) {
        throw new Error('default export not found');
      }
      decorator = async (block) => {
        try {
           return await blockModule.default(block);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${blockName}`, error);
        }
      }
      if (blockModule.styles) {
        decorator.styles = blockModule.styles
          .map((stylesheet) => `/${blockFolder}/${stylesheet}`);
      }
      if (blockModule.inlineStyles) {
        decorator.inlineStyles = blockModule.inlineStyles
          .map((stylesheet) => `/${blockFolder}/${stylesheet}`);
      }
      if (!blockModule.styles && !blockModule.inlineStyles) {
        decorator.inlineStyles = [`/${blockFolder}/${blockName}.css`]
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load block ${blockName}`, error);
      decorator = async () => Promise.reject();
    }
    block.setAttribute('data-block-status', 'loaded');
  } else {
    console.log(`tried to load block twice ${blockName}`);
    decorator = async () => Promise.resolve();
  }

  return decorator;
}

async function loadStyles({ styles, inlineStyles }) {
  const loadStyle = async (stylesheet, inline) => {
    const resp = await fetch(`${window.hlx.codeBasePath}${stylesheet}`);
    if (resp.ok) {
      const text = await resp.text();
      return `
        <mj-style${inline && ' inline="true"'}>
          ${text}
        </mj-style>
      `;
    } else {
      console.log(`failed to load stylesheet: ${stylesheet}`);
    }
  }
  const styles$ = styles 
    ? styles.map(async (stylesheet) => loadStyle(stylesheet, false))
    : [];
  const inlineStyles$ = inlineStyles 
    ? inlineStyles.map(async (stylesheet) => loadStyle(stylesheet, true))
    : []

  return Promise.all(styles$.concat(inlineStyles$));
}

function reduceMjml(mjml) {
  return mjml.reduce(
    ([body, head], [sectionBody, sectioHead]) => [
      body + (sectionBody || ''), 
      head + (sectioHead || '')
    ],
     ['', '']);
}

async function toMjml(main) {
  const mjml2html$ = loadMjml();
  const [mjmlBody, mjmlHead]  = reduceMjml(await Promise.all([...main.querySelectorAll(':scope > .section')].map(async (section) => {
    return reduceMjml(await Promise.all([...section.children].map(async (wrapper) => {
      if (wrapper.matches('.default-content-wrapper')) {
        return Promise.resolve([`
          <mj-section>
            <mj-column>
              <mj-text>${wrapper.innerHTML}</mj-text>
            </mj-column>
          </mj-section>
        `]);
      } else {
          const block = wrapper.querySelector('.block');
          if (block) {
            const decorator = await loadBlock(block);
            const decorated$ = decorator(block);
            const styles$ = loadStyles(decorator);
            return Promise.all([decorated$, styles$]);
          } else {
            return Promise.resolve([]);
          }
      }
    })));
  })));

  const mjml = `
    <mjml>
      <mj-head>
        ${mjmlHead}
      </mj-head>
      <mj-body>
        ${mjmlBody}
      </mj-body>
    </mjml>
  `;
  const mjml2html = await mjml2html$;
  console.log(mjml);
  const { html } = mjml2html(mjml);
  const iframe = document.createElement('iframe');
  iframe.srcdoc = html;
  iframe.width = "100%";
  iframe.height = "100%";
  document.body.insertAdjacentElement('beforebegin', iframe);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  toMjml(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP([]);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  sampleRUM('lazy');
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
}

loadPage();
