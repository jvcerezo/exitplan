import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Exit<span className="text-primary">Plan</span>
          </h1>
          <CardTitle className="text-lg text-muted-foreground">
            Sign in to your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Authentication coming soon. For now, create a user in the Supabase
            dashboard and use the API directly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
