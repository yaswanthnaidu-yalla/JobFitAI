import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import NewJob from "@/pages/NewJob";
import JobDetail from "@/pages/JobDetail";
import CandidateDetail from "@/pages/CandidateDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs/new" element={<NewJob />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/candidates/:cid" element={<CandidateDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
