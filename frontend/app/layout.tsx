import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./Context/CartContext";

export const metadata: Metadata = {
  title: "ShopEase",
  description: "Your trusted online shopping destination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
