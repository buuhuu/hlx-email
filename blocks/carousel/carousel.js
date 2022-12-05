const template = (props) => `
  <mj-carousel css-class="plop" left-icon="/icons/circle_chevron_left_icon.svg" right-icon="icons/circle_chevron_right_icon.svg" icon-width="24px">
    ${props.items.map((item) => `
    <mj-carousel-image css-class="carousel-image" src="${item.src}" />
    `).join('')}
  </mj-carousel>
`;

export default function decorate(block) {
  const items = Array.from(block.querySelectorAll(':scope picture source:last-of-type')).map((item) => ({
    src: item.srcset,
  }));

  return template({ items });
}
