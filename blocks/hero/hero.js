export default function decorate(block) {
  const img = block.querySelector('img');
  const texts = [...block.querySelectorAll(':scope > div > div > :not(picture)')];
  return `
    <mj-hero css-class="hero" mj-class="hero" background-url="${img.src}">
        <mj-text mj-class="hero-text">
            ${texts.map((el) => el.outerHTML).join('')}
        </mj-text>
    </mj-hero>
    `;
}
