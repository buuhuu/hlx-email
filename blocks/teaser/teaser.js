export default async function decorate(block, window) {
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
                <mj-text mj-class="mj-teaser-button">
                    <table>
                        <tbody>
                            <tr>
                                <td>${buttonContainer.firstElementChild.textContent}</td>
                                <td width="10px">&nbsp;</td>
                                <td><img src="${buttonSrcUrl}" width="34" height="34"/></td>
                            </tr>
                        </tbody>
                    </table>
                </mj-text>
            </mj-column>
        </mj-section>
    `
}