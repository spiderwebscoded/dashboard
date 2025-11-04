
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Tasks from "@/pages/Tasks";
import TaskDetail from "@/pages/TaskDetail";
import Team from "@/pages/Team";
import TeamDetail from "@/pages/TeamDetail";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Analytics from "@/pages/Analytics";
import Revenue from "@/pages/Revenue";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Solutions from "@/pages/Solutions";
import MarketingAgency from "@/pages/solutions/MarketingAgency";
import SoftwareDevelopment from "@/pages/solutions/SoftwareDevelopment";
import ConsultingFirms from "@/pages/solutions/ConsultingFirms";
import Construction from "@/pages/solutions/Construction";
import Healthcare from "@/pages/solutions/Healthcare";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import BlogAdmin from "@/pages/BlogAdmin";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/solutions/marketing" element={<MarketingAgency />} />
              <Route path="/solutions/software" element={<SoftwareDevelopment />} />
              <Route path="/solutions/consulting" element={<ConsultingFirms />} />
              <Route path="/solutions/construction" element={<Construction />} />
              <Route path="/solutions/healthcare" element={<Healthcare />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:projectId" element={<ProjectDetail />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:taskId" element={<TaskDetail />} />
                <Route path="team" element={<Team />} />
                <Route path="team/:memberId" element={<TeamDetail />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:clientId" element={<ClientDetail />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="settings" element={<Settings />} />
                <Route path="blog" element={<BlogAdmin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
