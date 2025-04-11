export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  title: string;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <section className="min-h-screen px-2 flex justify-center items-center">{children}</section>
      </body>
    </html>
  );
}
