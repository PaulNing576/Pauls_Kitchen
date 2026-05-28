function layout({title, bodyHtml}) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body style="font-family: -apple-system, Segoe UI, Roboto, sans-serif;
               background: #faf7f2; padding: 32px; color: #1a1a1a;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff;
                border-radius: 16px; padding: 32px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
      <h1 style="margin: 0 0 16px; font-size: 22px;">Paul's Kitchen</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #888;">
        Paul's Kitchen — private dining by reservation only.
      </p>
    </div>
  </body>
</html>`;
}

module.exports = {layout};
