const template = (props) => `
  <mj-section>
    <mj-column>
      <mj-accordion css-class="accordion">
        ${props.items.map((item) => `
        <mj-accordion-element css-class="accordion-element"
          icon-wrapped-url="/icons/circle_chevron_down_icon.jpg"
          icon-unwrapped-url="/icons/circle_chevron_up_icon.jpg"
          icon-height="24px"
          icon-width="24px">
          <mj-accordion-title css-class="accordion-title">${item.title}</mj-accordion-title>
          <mj-accordion-text css-class="accordion-text">${item.text}</mj-accordion-text>
        </mj-accordion-element>
        `).join('')}
      </mj-accordion>
    </mj-column>
  </mj-section>
`;

export default function decorate(block) {
  const items = Array.from(block.querySelectorAll(':scope > div > div')).map((item) => ({
    title: item.querySelector('h2').textContent,
    text: item.querySelector('p').textContent,
  }));

  return template({ items });
}
