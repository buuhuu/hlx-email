import { decorateDefaultContent } from '../../scripts/scripts.js';

export default function decorate(block) {
  let mjml = `<mj-section css-class="colums-cols-${block.firstElementChild.children.length}">`;
  [...block.firstElementChild.children].forEach((div, index) => {
    mjml += `
      <mj-column css-class="columns-col-${index + 1}">
        ${decorateDefaultContent(div)}
      </mj-column>
    `;
  });
  mjml += '</mj-section>';
  return mjml;
}
