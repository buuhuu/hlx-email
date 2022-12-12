import { decorateDefaultContent } from '../../scripts/functions.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const filteredClassList = [...block.classList]
    .filter((cls) => cls !== 'columns' && cls !== 'block');
  const type = filteredClassList.length ? `-${filteredClassList[0]}` : ''; 
    
  let mjml = `<mj-section mj-class="mj-colums${type}-cols-${cols.length}">`;
  cols.forEach((div, index) => {
    mjml += `
      <mj-column mj-class="mj-columns${type}-col mj-columns${type}-col-${index + 1} mj-columns${type}-col-${index === 0 ? 'first' : (index === cols.length - 1 ? 'last' : '')}">
        ${decorateDefaultContent(div)}
      </mj-column>
    `;
  });
  mjml += '</mj-section>';
  return mjml;
}
