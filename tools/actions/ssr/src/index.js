import fetch from 'node-fetch';
import jsdom from 'jsdom';
import less from 'less';

async function render(tld = 'page', pathname = '/') {
    const base = `https://main--hlx-email--buuhuu.hlx.${tld}`;
    const url = base + pathname;
    const resp = await fetch(url);

    if (!resp.ok) {
        return { statusCode: resp.status, body: resp.statusText }
    }

    const text = await resp.text();

    // create a global bowserlike scope the script.js can run in
    const dom = new jsdom.JSDOM(text, { url });

    global.fetch = (path, options) => {
        if (path.charAt(0) === '/') {
            path = base + path;
        }
        return fetch(path, options);
    }
    global.window = dom.window;
    global.document = dom.window.document;
    global.window.less = less;
    global.window.mjml = await import('mjml-browser').then(m => m.default); // requires the window object

    return new Promise((resolve, reject) => {
        global.window.addEventListener('mjml2html', ({ detail: { html } }) => {
            console.log('ssr: rendering finished, received mjml2html event.')
            resolve({
                statusCode: 200,
                body: html,
                headers: {
                    ...resp.headers,
                    'Content-Type': 'text/html'
                }
            });
        }, { once: true });

        // import the script to loadPage()
        import('../../../../scripts/scripts.js');
    });
}

export async function main(params) {
    const { tld = 'page', path } = params;
    if (!path) {
        return { statCode: 404, body: 'Not Found' }
    }

    return render(tld, path);
}
