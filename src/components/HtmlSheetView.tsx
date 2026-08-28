// Native build — wraps react-native-webview. See HtmlSheetView.web.tsx for
// the web build (react-native-webview has no web implementation at all).
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../lib/theme';

export function HtmlSheetView({ html }: { html: string }) {
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={styles.webview}
      scalesPageToFit
      renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.primary} />}
      startInLoadingState
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: '#fff' },
});
