import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Python do Zero | Curso para iniciantes",description:"Aprenda Python do zero com aulas curtas, exemplos práticos e uma trilha de progresso."};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}
