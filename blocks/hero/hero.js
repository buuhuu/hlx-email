export default function decorate(block) {
  const img = block.querySelector('img');
  const texts = [...block.querySelectorAll(':scope > div > div > :not(picture)')];
  let content = '';
  if (texts.length) {
    content += `
        <mj-text mj-class="hero-text">
            ${texts.map((el) => el.outerHTML).join('')}
        </mj-text>
    `;
  }
  return `
    <mj-hero css-class="hero" mj-class="hero" background-url="${img.src}">
        ${content}
    </mj-hero>
    `;
}
