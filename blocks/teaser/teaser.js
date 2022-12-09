export default async function decorate(block) {
    const [imgContainer, textContainer] = block.firstElementChild.children;
    const img = imgContainer.querySelector('img');
    const buttonContainer = textContainer.querySelector('.button-container');
    buttonContainer.remove();

    const { href: buttonHref } = buttonContainer.firstElementChild;
    const buttonSrcUrl = new window.URL('/icons/square_right.gif', window.location.href);


    return `
        <mj-section mj-class="mj-teaser-section">
            <mj-column mj-class="mj-teaser-image-column">
                <mj-image src="${img.src}"/>
            </mj-column>
            <mj-column mj-class="mj-teaser-text-column">
                <mj-text mj-class="mj-teaser-text">${textContainer.innerHTML}</mj-text>
                <mj-button mj-class="mj-teaser-button" href="${buttonHref}">
                    <span>${buttonContainer.firstElementChild.textContent} &nbsp;<span> <img src="${buttonSrcUrl}" width="34" height="34"/>
                </mj-button>
            </mj-column>
        </mj-section>
    `
}