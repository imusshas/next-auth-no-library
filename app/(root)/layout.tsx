import Header from "@/components/server/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-8 md:px-12 lg:px-20 flex flex-col justify-center items-center">
        {children}
      </main>
    </section>
  );
}
