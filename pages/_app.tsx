import type { AppProps } from 'next/app';

import '../tailwind.css';

import '@fontsource/inter';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
