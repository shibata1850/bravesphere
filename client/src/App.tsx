import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Analysis from "./pages/Analysis";
import AnalysisResult from "./pages/AnalysisResult";
import ShotChart from "./pages/ShotChart";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/teams"} component={Teams} />
      <Route path={"/teams/:id"} component={TeamDetail} />
      <Route path={"/games"} component={Games} />
      <Route path={"/games/:id"} component={GameDetail} />
      <Route path="/games/:id/analysis" component={AnalysisResult} />
      <Route path="/games/:id/shotchart" component={ShotChart} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

