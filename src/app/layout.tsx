import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idea Bounty - 商业点子收集器",
  description: "提交你的商业创意，AI 评估商业价值，赢取红包奖励",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
