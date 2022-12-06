function transformAdobeCampaignResponse(data) {
    return Object.entries(data)
        .map(([key, object]) => {
            if (object.content) {
                // folder
                const items = transformAdobeCampaignResponse(object.content);
                if (items.length) {
                    return { label: object.label, key, items };
                }
            } else if (object.tag && object.tag.indexOf('<%=') === 0) {
                // element
                const key = object.tag.substring(3, object.tag.length - 2).trim();
                if (key) {
                    return { label: object.label, key }
                }
            }

            return null;
        })
        .filter(el => !!el)
        .sort()
        .sort((left, right) => {
            if (left.items && !right.items) {
                return -1;
            } if (right.items && !left.items) {
                return 1;
            } else {
                return left.label.localeCompare(right.label);
            }
        })

}

async function handleAdobeCampaign(origin, pathname, params) {
    const url = P_API_URL;
    const user = P_API_USER;
    const password = P_API_PASSWORD;

    let body = 'Not Found';
    let status = 404

    if ('/personalisationFields' === pathname) {
        const delivery = params.get('delivery');
        const upstreamResponse = await fetch(`${url}/jssp/nms/amcGetDeliveryMetadata.jssp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            body: `__sessiontoken=${user}/${password}&delivery=${delivery}`
        });

        if (upstreamResponse.ok) {
            const data = await upstreamResponse.json();
            if (data) {
                status = 200;
                body = JSON.stringify(transformAdobeCampaignResponse(data));
            }
        }
    }

    return new Response(body, {
        status: status,
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': origin,
            'Vary': 'Origin'
        }
    });
}

async function handleRequest(request) {
    const { headers } = request;
    const { searchParams, pathname } = new URL(request.url);
    const type = P_API_TYPE;
    const origin = headers.get('Origin');

    if (origin !== null && (origin.match(/.*\.hlx\.(page|live)/) || origin.match('localhost:\d+'))) {
        switch (type) {
            case 'adobe-campaign': return handleAdobeCampaign(origin, pathname, searchParams);
            default: return Response(null, {
                status: 404,
                statusText: 'Not Found',
                headers: { 'Access-Control-Allow-Origin': origin }
            });
        }
    } else {
        return Response(null, {
            status: 405,
            statusText: 'Not Allowed'
        })
    }
}

addEventListener('fetch', event => {
    const { request } = event;

    if (request.method === 'GET') {
        // Handle requests to the API server
        event.respondWith(handleRequest(request));
    } else {
        event.respondWith(
            new Response(null, {
                status: 405,
                statusText: 'Method Not Allowed',
            })
        );
    }
});