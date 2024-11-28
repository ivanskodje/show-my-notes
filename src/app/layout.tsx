import type { Metadata } from "next";
import "../style/globals.css";
import { Providers } from "@/app/components/Providers";
import appConfig from "@/infrastructure/config/appConfig";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { firaCode, inter, poppins } from "@/style/fonts";
import { registerDependencies } from "@/infrastructure/dependency-injection/dependency.config";

export const metadata: Metadata = {
  title: appConfig.appName,
  description: appConfig.appDescription,
};

registerDependencies();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${firaCode.variable} ${poppins.variable}`}
    >
      <body className={`antialiased`}>
        <Providers>
          <nav>
            <h1>{appConfig.appName}</h1>
            <div className="flex flex-row items-center justify-start space-x-4">
              <ThemeSwitcher />
              <Breadcrumbs />
            </div>
          </nav>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
