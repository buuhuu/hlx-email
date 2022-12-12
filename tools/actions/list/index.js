const { default: fetch } = require('node-fetch')

async function main(params) {
    const url = params['__ow_path'] || 'main--hlx-email--buuhuu.hlx.live';
    const response = await fetch(`https://${url}/query-index.json`);
    
    if (response.ok) {
        const body = await response.json();
        return { status: 200, body };
    } else {
        return { status: response.status, body: response.statusText };
    }
}

exports.main = main
