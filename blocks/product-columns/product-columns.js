export default async function decorate(block, window) {
    const rows = [...block.children];
    const imagesRow = rows[0]; 
    const pricesRow = rows[1];
    const ctasRow = rows[2];

    const columns = [...ctasRow.children].map((cta, i) => {
        const { href, textContent: ctaText } = cta.firstElementChild;
        const imageCell = imagesRow.children[i];
        const { src } = imageCell.querySelector('img');
        const variantChooser = [...imageCell.lastElementChild.children]
            .map(({ href, title, textContent }) => {
                textContent = textContent.trim();
                const iconUrl = new window.URL(`${window.hlx.codeBasePath}/icons/circle_color_${textContent}.jpg`, window.location.href);
                return `
                    <a href="${href}" title="${title}">
                        <img class="product-columns-variant-img" src="${iconUrl}"/>
                    </a>
                `;
            })
            .join('');

        return `
            <mj-column mj-class="mj-product-columns-container${i === ctasRow.children.length - 1 ? ' mj-product-columns-container-last' : ''}">
                <mj-image href="${href}" mj-class="mj-product-columns-img" src="${src}"/>
                <mj-text mj-class="mj-product-columns-text mj-product-columns-variants">
                    ${variantChooser}
                </mj-text>
                <mj-text mj-class="mj-product-columns-text">${pricesRow.children[i].innerHTML}</mj-text>
                <mj-button mj-class="mj-product-columns-button" href="${href}">${ctaText}</mj-button>
            </mj-column>
        `;
    })


    return `
        <mj-section mj-class="mj-product-colunns">
            ${columns.join('')}
        </mj-section>
    `;
}