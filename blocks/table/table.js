export default function decorate(block) {
  let mjml = `<mj-table css-class="email-table">`;
  const rows = [...block.children];
  rows.forEach((row, i) => {
    mjml += `<tr>`;
    const cells = [...row.children];
    cells.forEach((cell, j) => {
      if (i === 0) {
        mjml += `<th>${cell.innerHTML}</th>`;
      } else {
        mjml += `<td>${cell.innerHTML}</td>`;
      }
    })
    mjml += `</tr>`;
  })
  mjml += `</mj-table>`;
  return mjml;
}
