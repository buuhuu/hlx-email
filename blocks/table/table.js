export default function decorate(block) {
  let mjml = `
    <mj-section>
      <mj-column>
        <mj-table css-class="table">
`;
  const rows = [...block.children];
  rows.forEach((row, i) => {
    mjml += '<tr>';
    const cells = [...row.children];
    cells.forEach((cell) => {
      if (i === 0) {
        mjml += `<th>${cell.innerHTML}</th>`;
      } else {
        mjml += `<td>${cell.innerHTML}</td>`;
      }
    });
    mjml += '</tr>';
  });
  mjml += `
        </mj-table>
      </mj-column>
    </mj-section>
`;
  return mjml;
}
