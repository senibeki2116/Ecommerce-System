import type { Metadata } from "next";
import Chatbot from "../components/Chatbot";
import { CartProvider } from "./Context/CartContext";
import "./globals.css";

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
        <CartProvider>
          {children}
          <Chatbot />
        </CartProvider>
      </body>
    </html>
  );
}