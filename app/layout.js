import "./globals.css";

export const metadata = {
  title: "Formulir Pendaftaran Buka Bersama DKM Paramadina",
  description: "Buka Bersama - DKM Paramadina",
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

