export default function decorate(block) {
  const link = block.querySelector(':scope > div > div > a');
  const mjml = `
    <mj-section>
      <mj-column>
        <mj-button css-class="email-button" href="${link.href}">
          ${link.innerText}
         </mj-button>
      </mj-column>
    </mj-section>
  `;
  return mjml;
}
