import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4 fantasy-card">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-display font-bold text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            You seem to have wandered off the map, adventurer. This path leads nowhere.
          </p>

          <div className="mt-6">
             <Link href="/" className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors w-full">
               Return to Battle
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
