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
  const createJPGSource = (src) => {
    const url = new URL(src);
    url.search = 'width=2000&format=jpeg&optimize=medium';
    return url;
  };

  const items = Array.from(block.querySelectorAll(':scope picture img')).map((item) => ({
    src: createJPGSource(item.src),
  }));

  return template({ items });
}
