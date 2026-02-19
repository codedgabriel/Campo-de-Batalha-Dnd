import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Tracker from "@/pages/Tracker";
import { useLockLandscape } from "@/hooks/use-lock-landscape";
import { RotateOverlay } from "@/components/RotateOverlay";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Tracker} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isPortrait } = useLockLandscape();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Overlay que cobre tudo quando o celular está em portrait */}
        {isPortrait && <RotateOverlay />}

        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
