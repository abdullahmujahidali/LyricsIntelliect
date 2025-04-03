import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Router from "./router";

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
