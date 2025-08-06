// components/Layout.tsx
import { ReactNode } from 'react';
import Head from 'next/head';
import '../styles/global.css'; 

interface LayoutProps {
  title?: string;
  children: ReactNode;
  backgroundImage?: string;
}

export default function Layout({
  title = 'Giriş Yap',
  children,
  backgroundImage = '/background2.jpg',
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="page-container"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="content-wrapper">{children}</div>
      </div>
    </>
  );
}
