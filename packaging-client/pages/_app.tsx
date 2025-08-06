// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/global.css'; // Global stilleri buradan uygula

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
