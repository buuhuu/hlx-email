export default async function decorate(block) {
    const container = block.closest('.navbar-container');
    const img = container.querySelector('img');
    const navigationItems = [...block.children[1].children]
        .filter((element) => element.matches('.button-container') )
        .map((element) => {
            const { href, textContent } = element.firstElementChild;
            return `<mj-navbar-link href="${href}">${textContent}</mj-navbar-link>`;
        })

    return `
        <mj-section mj-class="mj-navbar-container">
            <mj-column mj-class="mj-navbar-column">
                <mj-image mj-class="mj-navbar-logo" src="${img.src}" />
                <mj-navbar hamburger="none">
                    ${navigationItems.join('')}
                </mj-navbar>
            </mj-column>
        </mj-section>
    `
}