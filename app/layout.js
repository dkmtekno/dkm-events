import "./globals.css";

export const metadata = {
  title: "Formulir Pendaftaran Isra Miraj",
  description: "Isra Miraj - The Night Journey",
  icons: "/icon_dkm.png",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon_dkm.png" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
