export default function decorate(block) {
  let mjml = '<mj-section>';
  [...block.firstElementChild.children].forEach((div) => {
    mjml += `
      <mj-column>
        <mj-text>${div.innerHTML}</mj-text>
      </mj-column>
    `;
  });
  mjml += '</mj-section>';
  return mjml;
}
