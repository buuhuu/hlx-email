export default function decorate(block) {
    const img = block.querySelector('img');
    const texts = [...block.querySelectorAll(':scope > div > div > :not(picture)')];
    return `
    <mj-hero 
        css-class="hero"
        background-position="left"
        background-width="600px"
        background-height="150px"
        background-url="${img.src}"
        mode="fluid-height"
        padding-left="33%">
        <mj-text align="right" color="#fff" line-height="1.3em" css-class="text">
            ${texts.map((el) => el.outerHTML).join('')}
        </mj-text>
    </mj-hero>
    `;
}