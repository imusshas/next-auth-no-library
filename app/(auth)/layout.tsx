export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  title: string;
}>) {
  return <main className="min-h-screen px-2 flex justify-center items-center">{children}</main>;
}
