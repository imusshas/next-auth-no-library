export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="min-h-screen px-2 flex justify-center items-center">{children}</section>;
}
