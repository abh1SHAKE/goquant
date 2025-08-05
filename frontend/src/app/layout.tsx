// Overall layout for the application
// This file defines the overall layout structure for the Next.js application.

import type { Metadata } from "next";
import { Inter_Tight, Gabarito, Bebas_Neue, Sora } from 'next/font/google';
import "./globals.css";

const interTight = Inter_Tight({
    subsets: ['latin'],
    variable: '--font-inter-tight',
    display: 'swap',
});

const gabarito = Gabarito({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--font-gabarito',
    display: 'swap',
});

const sora = Sora({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-sora',
    display: 'swap'
})

const bebasNeue = Bebas_Neue({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-bebas-neue',
	display: 'swap',
});

export const metadata: Metadata = {
	title: "Orderbook66",
	description: "Execute your trades, not the Jedi.",
};

export default function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${interTight.variable} ${gabarito.variable} ${bebasNeue.variable} ${sora.variable} antialiased`}
			>
				<main className="max-w-7xl mx-auto px-4 py-6 md:py-10">{children}</main>
			</body>
		</html>
	);
}
