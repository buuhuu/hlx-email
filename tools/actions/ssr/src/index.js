import fetch from 'node-fetch';
import jsdom from 'jsdom';
import less from 'less';
import mjml from 'mjml';
import { decorateMain, toMjml, init as initLibFranklin } from '../../../../scripts/functions.js';

async function render(tld = 'page', pathname = '/') {
    const base = `https://main--hlx-email--buuhuu.hlx.${tld}`;
    const url = base + pathname;
    const resp = await fetch(url);

    if (!resp.ok) {
        return { statusCode: resp.status, body: resp.statusText }
    }

    const text = await resp.text();

    // create dom
    const dom = new jsdom.JSDOM(text, { url });
    dom.window.fetch = (path, options) => fetch(path.charAt(0) === '/' ? base + path : path, options);
    dom.window.less = less;
    dom.window.mjml = mjml;

    // franklin
    const main = dom.window.document.querySelector('main');
    initLibFranklin(dom.window);
    decorateMain(main);
    return { statusCode: 200, body: await toMjml(main) };
}

export async function main(params) {
    const { preview } = params;
    const path = params['__ow_path'] || '/';
    return render(typeof preview !== 'undefined' ? 'page' : 'live', path);
}
