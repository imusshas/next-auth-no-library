import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type FormCardProps = {
  title: string;
  showDescription?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function FormCard({ title, showDescription = true, children, footer }: FormCardProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {showDescription && <CardDescription>Please {title.toLowerCase()} to continue</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-center">{footer}</CardFooter>
    </Card>
  );
}
