# Franklin for E-Mail Boilerplate

This is a bolierplate that helps getting started with generating responsive e-mail templates with Franklin using
[mjml](https://mjml.io).

It in particular inherits the Authoring Experience and Developer Experience from Franklin for, the Delivery is
signifiicantly different though. 

As E-Mail clients usually do not support Javascript the fully rendered E-Mail template is made available to the author
to Copy & Paste it in their preferred Marketing Automation tool, or to directly downloaded it and send it with a local
E-Mail client.

## Environments
- Preview: https://main--{repo}--{owner}.hlx.page/
- Live: https://main--{repo}--{owner}.hlx.live/

## How it works

As with other Franklin projects the decoration of the DOM happens clientside, in the author's browsers when previewing
a document.

As usual the project scripts decorate the DOM as it gets served from the franklin html pipeline (icons, auto-blocking, 
sections, blocks, ...). Afterwards the decorated DOM is used to create an mjml E-Mail template, which gets transpiled
into E-Mail friendly HTML. This HTML is  than presented to the user in an iframe that fully covers the original page. 

Sidekick extensions allow the author to copy or download the generated HTML.

### Default Content

Default content, like texts, lists buttons and images are supported:

- `<img>` get transformed to `<mj-image>` 
- `<a>` inside of `.button-container`s get transformed to `<mj-button>`
- all other types of paragraphs (`<p>`, `<ul>`, `<h1>`, `<h2>`, ...) get wrapped into `<mj-text>`

The scripts.js module exports a function to make this logic reusable for blocks that wrap default content, like the
columns block.

### Blocks

Other than in Franklin for Web projects the blocks in this boilerplate do not decorate the given DOM but have to return
an mjml-string instead. 

```javascript
export default async function(block) {
    return `
        <mj-section>
            <mj-column>
                <mj-text>Hello World</mj-text>
            </mj-column>
        </mj-section>
    `;
}
```

These mjml-strings get than concatenated to generate the contents of the mjml template body. 

It is important to mention that the output of a block needs to be wrapped in a `<mj-section>` and `<mj-column>`. 

The following blocks are availabe as part of the boilerplate:

- [Columns](blocks/columns) using [`<mj-column>`](https://documentation.mjml.io/#mj-column)
- [Accordion](blocks/accordion) using [`<mj-accordion>`](https://documentation.mjml.io/#mj-accordion)
- [Carousel](blocks/carousel) using [`<mj-carousel>`](https://documentation.mjml.io/#mj-carousel)
- [Hero](blocks/hero) using [`<mj-section>`](https://documentation.mjml.io/#mj-section) with a background image
- [Table](blocks/table) using [`<mj-table>`](https://documentation.mjml.io/#mj-table)

### Styles

Stylesheets get fetched and included into the mjml template's head. There are two global stylesheets 
[email-styles.css](styles/email-styles.css) and [email-inline-styles.css](styles/email-inline-styles.css). As the name
suggest the later will be included with `<mj-style inline="inline">` which will inline the styles into the markup. 
Declarations that cannot be inlined like media queries, pseudo selectors or selectors that target boilerplate elements
injected by email clients should be kept in the respective stylesheet that does not get inlined.

Blocks can export stylesheets as well. Per default a single css file is fetched for each blocked and treated as inline
style. However the block module can provide two named exports `styles` and `inlineStyles` to specify which stylesheets
to fetch and how to treat them.

Keep in mind that it is necessary to set a `css-class` attribute in mjml to add a class to the rendered html. 

### [Attributes](https://documentation.mjml.io/#mj-attributes)

> *⚠️ Using attributes is preferred over using css styles.*

Most of the styles can be applied with attributes on the the mjml elements themself. These will be inlined similar to
inline styles. However, especially for styles of the box model (width, borders, paddings, ...) the values are also 
taken into account to calculate absolute values for clients that do not have full support for the box model (e.g. 
Outlook). 

To make setting the mjml attributes as easy as styling the DOM with css this boilerplate supports the definition of 
[`<mj-attributes>`] in css files. In fact each fetched stylesheet is parsed, some rules removed from the and added
to the mj-head as mjml attributes instead. This includes:

- rules with a tag selector for mjml elements inlcuding `mj-all`, e.g.
  ```css
  mj-button { border-radius: 2px, background-color: orange; }
  mj-all { font-size: 15px; font-family: Arial}
  ```

  will be included in the `<mj-head>` as
  
  ```xml
  <mj-attributes>
    <mj-button border-radius="2px" background-color="orange"/>
    <mj-all font-size="15px" font-family="Arial">
  </mj-attributes>
  ```
- rules with class selectors that start with `.mj-` or are specific to `mj-all`, e.g.
  ```css
  .mj-hero-spacer { height: 180px }
  .mj-hero-text { color: white }
  mj-all.highlight { background-color: #bfbfbf; }
  ```

  will be included in the `<mj-head>` as
  
  ```xml
  <mj-attributes>
    <mj-class name="mj-hero-spacer" height="180px"/>
    <mj-class name="mj-hero-text" color="white"/>
    <mj-class name="highlight" background-color="#bfbfbf"/>
  </mj-attributes>
  ```
- rules that target only a specific template (a class on the `<body>` of the original   DOM), e.g.
  ```css
  .newsletter-spring-2022 .mj-hero-spacer { height: 200px }
  .newsletter-spring-2022 mj-button { color: white; background-color: orange }
  ```

  will only be included when the first element of the selectors matches the document body:
  
  ```html
  <html>
    <body class="newsletter-spring-2022">
        ...
    </body>
  </html>
  ```

## Installation

```sh
npm i
```

## Tests

```sh
npm tst
```

## Local development

1. Create a new repository based on the `helix-project-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [helix-bot](https://github.com/apps/helix-bot) to the repository
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Helix Pages Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)
