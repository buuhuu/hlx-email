import {
  buildBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateTemplateAndTheme,
  sampleRUM,
  waitForLCP,
} from './lib-franklin.js';

window.hlx.RUM_GENERATION = 'hlx-email'; // add your RUM generation information here
window.thridPartyScripts = [];
window.personalizationType = 'adobe-campaign-standard';

const mjmlTemplate = (mjmlHead, mjmlBody) => `
<mjml>
  <mj-head>
    ${mjmlHead}
  </mj-head>
  <mj-body>
    ${mjmlBody}
  </mj-body>
</mjml>
`;

async function loadScript(src) {
  if (!document.querySelector(`head > script[src="${src}"]`)) {
    window.thridPartyScripts[src] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.crossOrigin = true;
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.thridPartyScripts[src];
  }
  return window.thridPartyScripts[src];
}

async function loadMjml(src = 'https://unpkg.com/mjml-browser@4.13.0/lib/index.js') {
  await loadScript(src);
  return window.mjml;
}

async function loadLess(src = 'https://unpkg.com/less@4.1.3/dist/less.min.js') {
  await loadScript(src);
  return window.less;
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
      decorator = async (b) => {
        try {
          return await blockModule.default(b);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${blockName}`, error);
          return null;
        }
      };
      if (blockModule.styles) {
        decorator.styles = blockModule.styles
          .map((stylesheet) => `/${blockFolder}/${stylesheet}`);
      }
      if (blockModule.inlineStyles) {
        decorator.inlineStyles = blockModule.inlineStyles
          .map((stylesheet) => `/${blockFolder}/${stylesheet}`);
      }
      if (!blockModule.styles && !blockModule.inlineStyles) {
        decorator.inlineStyles = [`/${blockFolder}/${blockName}.css`];
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

async function parseStyle(css) {
  const less = await loadLess();
  const ast = await less.parse(css);
  const attributes = {};

  for (let i = 0; i < ast.rules.length; i += 1) {
    const rule = ast.rules[i];
    if (rule.isRuleset) {
      // get the mj-* selectors
      const defs = rule.selectors
        .map((selector) => {
          const first = selector.elements[0];
          if (first && first.value && first.value.indexOf('mj-') !== 0) {
            return null;
          }
          const second = selector.elements[1];
          if (second && second.value && second.value.charAt(0) === '.') {
            if (first.value !== 'mj-all') {
              // mj-class is not element specific
              console.log('className not supported for mj elements other than mj-all');
              return null;
            }
            return { mjEl: first.value, mjClass: second.value.substring(1) };
          }
          return { mjEl: first.value };
        })
        .filter((def) => !!def);

      if (defs.length) {
        // remove the rule from the ruleset
        ast.rules.splice(i, 1);
        i -= 1;
        const declarations = rule.rules
          .map((declaration) => {
            const [{ value: name }] = declaration.name;
            let value = declaration.value.toCSS();
            if (value.charAt(0) === '\'') value = value.substring(1);
            if (value.charAt(value.length - 1) === '\'') value = value.substring(0, value.length - 1);
            return [name, value];
          })
          .filter((decl) => !!decl)
          .reduce((map, [name, value]) => ({ ...map, [name]: value }), {});
        if (Object.keys(declarations).length) {
          defs.forEach(({ mjEl, mjClass = '*' }) => {
            if (!attributes[mjEl]) attributes[mjEl] = {};
            if (!attributes[mjEl][mjClass]) attributes[mjEl][mjClass] = {};
            attributes[mjEl][mjClass] = { ...attributes[mjEl][mjClass], ...declarations };
          });
        }
      }
    }
  }

  const { css: genCss } = new less.ParseTree(ast, []).toCSS({});

  return [attributes, genCss];
}

async function loadStyles({ styles, inlineStyles }) {
  const loadStyle = async (stylesheet, inline) => {
    const resp = await fetch(`${window.hlx.codeBasePath}${stylesheet}`);
    if (resp.ok) {
      let mjml = '';
      const text = (await resp.text()).trim();
      if (text) {
        const [attributes, parsedStyles] = await parseStyle(text);

        if (Object.keys(attributes).length) {
          mjml += '<mj-attributes>\n';
          Object.keys(attributes).forEach((mjEl) => {
            Object.keys(attributes[mjEl]).forEach((mjClass) => {
              if (mjClass === '*') {
                mjml += `<${mjEl} `;
              } else {
                mjml += `<mj-class name="${mjClass}" `;
              }
              mjml += Object.entries(attributes[mjEl][mjClass])
                .map(([name, value]) => `${name}="${value}"`)
                .join(' ');
              mjml += '/>\n';
            });
          });
          mjml += '</mj-attributes>\n';
        }
        if (parsedStyles) {
          mjml += `
            <mj-style${inline ? ' inline="true"' : ''}>
              ${parsedStyles}
            </mj-style>
          `;
        }
      }
      return mjml;
    }
    console.log(`failed to load stylesheet: ${stylesheet}`);
    return '';
  };
  const styles$ = styles
    ? styles.map(async (stylesheet) => loadStyle(stylesheet, false))
    : [];
  const inlineStyles$ = inlineStyles
    ? inlineStyles.map(async (stylesheet) => loadStyle(stylesheet, true))
    : [];

  return Promise.all(styles$.concat(inlineStyles$))
    .then((resolvedStylesheets) => resolvedStylesheets.join(''));
}

function reduceMjml(mjml) {
  return mjml.reduce(
    ([body, head], [sectionBody, sectioHead]) => [
      body + (sectionBody || ''),
      head + (sectioHead || ''),
    ],
    ['', ''],
  );
}

async function toMjml(main) {
  const mjml2html$ = loadMjml();
  const main$ = Promise.all([...main.querySelectorAll(':scope > .section')].map(async (section) => reduceMjml(await Promise.all([...section.children].map(async (wrapper) => {
    if (wrapper.matches('.default-content-wrapper')) {
      let mjmlParas = ``;
      [...wrapper.children].forEach((par) => {
        const img = par.querySelector(':scope > picture > img');
        if (img) {
          mjmlParas += `
              <mj-image css-class="image" src="${img.src}" />
          `;
        } else if (par.matches('.button-container')) {
          const link = par.querySelector(':scope > a');
          mjmlParas += `
              <mj-button css-class="button" href="${link.href}">
                ${link.innerText}
              </mj-button>
          `;
        } else {
          mjmlParas += `
              <mj-text>${par.innerHTML}</mj-text>
          `;
        }
      });
      return Promise.resolve([`
          <mj-section>
            <mj-column>
                ${mjmlParas}
            </mj-column>
          </mj-section>
        `]);
    }
    const block = wrapper.querySelector('.block');
    if (block) {
      const decorator = await loadBlock(block);
      const decorated$ = decorator(block);
      const styles$ = loadStyles(decorator);
      return Promise.all([decorated$, styles$])
        .catch((err) => {
          console.error(err);
          return [];
        });
    }
    return Promise.resolve([]);
  })))));
  const styles$ = loadStyles({
    styles: ['/styles/email-styles.css'],
    inlineStyles: ['/styles/email-inline-styles.css'],
  });

  const mjmlStyles = await styles$;
  const [body, head] = reduceMjml(await main$);

  const mjml = mjmlTemplate(mjmlStyles + head, body);
  const mjml2html = await mjml2html$;
  console.log(mjml);
  const { html } = mjml2html(mjml);
  const iframe = document.createElement('iframe');
  iframe.srcdoc = html;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.id = '__emailFrame';
  document.body.insertAdjacentElement('beforeend', iframe);
}

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const elems = [picture, h1];
    if (h1.nextElementSibling) {
      elems.push(h1.nextElementSibling);
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems }));
    main.prepend(section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function decoratePersonalization(main) {
  main.querySelectorAll('em').forEach((em) => {
    let text = em.innerText.trim();
    let content = '';
    let unwrap = true;
    let match;

    const transform = (expr) => {
      if (window.personalizationType === 'adobe-campaign-standard') {
        const nlExpr = `/${expr.replaceAll('.', '/')}`;
        const name = nlExpr.split('/').pop();
        return `<span class="acr-field nl-dce-field nl-dce-done" data-nl-expr="${nlExpr}" data-nl-type="string" data-contenteditable="false" contenteditable="false">${name}</span>`;
      }
      // fallback, no pers type, don't unwrap
      unwrap = false;
      return expr;
    };

    // eslint-disable-next-line no-cond-assign
    while (match = text.match(/[a-zA-Z0-9]+\.[a-zA-Z0-9.]+/)) {
      if (match.index > 0) {
        const fragment = text.substring(0, match.index);
        content += fragment;
        // unwrap only if there are only non-word characters in between the expressions
        unwrap = unwrap && !!fragment.match(/^\W+$/);
      }

      content += transform(match[0]);
      text = text.substring(match.index + match[0].length);
    }

    if (unwrap) {
      em.insertAdjacentHTML('afterend', content);
      em.remove();
    } else {
      em.innerHTML = content;
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decoratePersonalization(main);
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

  if (document.querySelector('helix-sidekick')) {
    import('../tools/sidekick/plugins.js');
  } else {
    document.addEventListener('helix-sidekick-ready', () => {
      import('../tools/sidekick/plugins.js');
    }, { once: true });
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
async function loadLazy(/* doc */) {
  sampleRUM('lazy');
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
}

loadPage();
