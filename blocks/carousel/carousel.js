const template = (props) => `
  <mj-section>
    <mj-column>
      <mj-carousel css-class="carousel" left-icon="/icons/circle_chevron_left_icon.jpg" right-icon="icons/circle_chevron_right_icon.jpg" icon-width="24px">
        ${props.items.map((item) => `
        <mj-carousel-image css-class="carousel-image" src="${item.src}" />
        `).join('')}
      </mj-carousel>
    </mj-column>
  </mj-section>
`;

export default function decorate(block) {
  const items = Array.from(block.querySelectorAll(':scope picture source[type="image/webp"]:not([media])')).map((item) => ({
    src: item.srcset,
  }));

  return template({ items });
}
