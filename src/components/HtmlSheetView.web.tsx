// Web build — react-native-webview has no web implementation, so this
// renders the same HTML via a plain iframe.
import React from 'react';

export function HtmlSheetView({ html }: { html: string }) {
  return (
    <iframe
      title="Invoice preview"
      srcDoc={html}
      style={{ flex: 1, width: '100%', height: '100%', border: 'none', background: '#fff' }}
    />
  );
}
