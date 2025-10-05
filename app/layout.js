import "./globals.css";

export const metadata = {
  title: "Formulir Pendaftaran Maulid Nabi Muhammad DKM Paramadina",
  description: "Maulid Nabi Muhammad - DKM Paramadina",
  icons: "/favicon.ico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon_dkm.png" />
      </head>
      <body className="bg-white">{children}</body>
    </html>
  );
}

