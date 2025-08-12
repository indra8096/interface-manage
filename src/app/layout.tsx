import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeWrapper from "@/components/ThemeWrapper";

config.autoAddCss = false;

const karla = Karla({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-karla"
});

export const metadata: Metadata = {
  title: "Tableau de Suivi Client",
  description: "Interface de gestion des tâches et du suivi client",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${karla.variable} font-karla`}>
        <ThemeProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
