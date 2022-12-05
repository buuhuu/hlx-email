class EmailSidekickBanner {
    constructor(id) {
      this.banner = document.createElement('div');
      this.banner.className = 'email-sidekick-banner';
      this.banner.id = id;
      this.banner.appendChild(document.createElement('style')).textContent = `
      .email-sidekick-banner {
        z-index: 9999998;
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        font-family: Arial, sans-serif;
        font-size: 1rem;
        background-color: red;
        color: white;
        padding: 0 20px;
      }
      .email-sidekick-banner a:any-link {
        color: white;
      }
      .email-sidekick-banner input,
      .email-sidekick-banner button {
        font-family: Arial, sans-serif;
        font-size: 1rem;
        background: transparent;
        color: white;
      }
      .email-sidekick-banner input {
        outline: none;
        border: none;
        width: 400px;
        text-overflow: ellipsis;
      }
      .email-sidekick-banner button {
        border: solid 1px white;
        border-radius: 8px;
        padding: 5px 8px;
        margin-left: 5px;
        user-selection: none;
        cursor: pointer;
      }`;
      this.bannerContent = this.banner.appendChild(document.createElement('p'));
      this.bannerContent.className = 'content';
      document.body.prepend(this.banner);
    }
  
    querySelector(selector) {
      return this.bannerContent.querySelector(selector);
    }
  
    write(content, timeout) {
      this.bannerContent.innerHTML = content;
      if (timeout) {
        this.hide(timeout);
      }
    }
  
    hide(timeout = 0) {
      setTimeout(() => {
        this.banner.remove();
      }, timeout * 1000);
    }
  }

const copyHtml = ({ detail }) => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
        navigator.clipboard.writeText(iframe.contentWindow.document.documentElement.innerHTML).then(() => {
            const banner = new EmailSidekickBanner('get-html-data');
            banner.write('HTML copied to clipboard', 5);
        });
    }
};

const sk = document.querySelector('helix-sidekick');
sk.addEventListener('custom:copyHtml', copyHtml);