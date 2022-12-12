export default async function decorate(block) {
    const container = block.querySelector('h1').parentElement;
    const buttonContainer = container.querySelector('.button-container');

    let button = '';
    if (buttonContainer) {
        buttonContainer.remove();
        const { href, textContent } = buttonContainer.firstElementChild;
        button = `
            <mj-button href="${href}" mj-class="mj-intro-button">
                ${textContent}
            </mj-button>
        `;
    }
    
    return `
        <mj-section mj-class="mj-intro-section">
            <mj-column mj-class="mj-intro-column">
                <mj-text mj-class="mj-intro-text">
                    ${container.innerHTML}
                </mj-text>
                ${button}
            </mj-column>
        </mj-section>
    `
}