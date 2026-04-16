import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
})

export const metadata = {
  title: "TLC ChatMate",
  description: "TLC ChatMate: A Web-based Conversational Agent for The Lewis College",
  icons: {
    icon: "/favicon.webp",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
