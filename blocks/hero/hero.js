export default function decorate(block) {
  const img = block.querySelector('img');
  const texts = [...block.querySelectorAll(':scope > div > div > :not(picture)')];
  // mj-hero has an issue with outlook in mode='fluid-height' https://github.com/mjmlio/mjml/issues/1253
  // the recommendation is to use a section instead
  // the 2nd column is used to give the section a min-height
  return `
    <mj-section mj-class="mj-hero" background-url="${img.src}">
        <mj-column width="100%">
            <mj-text mj-class="mj-hero-text">
                ${texts.map((el) => el.outerHTML).join('')}
            </mj-text>
        </mj-column>
        <mj-column width="0%">
            <mj-spacer mj-class="mj-hero-min-height" />
        </mj-column>
    </mj-section>
    `;
}
