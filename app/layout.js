import "./globals.css";

export const metadata = {
  title: "Formulir Pendaftaran Isra Miraj",
  description: "Isra Miraj - The Night Journey",
  icons: "/favicon.ico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon_dkm.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
