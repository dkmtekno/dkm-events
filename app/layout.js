import "./globals.css";

export const metadata = {
  title: "Formulir Pendaftaran Buka Bersama DKM Paramadina",
  description: "Buka Bersama - DKM Paramadina",
  icons: "/favicon.ico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon_dkm.png" />
      </head>
      <body className="bg-slate-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}

