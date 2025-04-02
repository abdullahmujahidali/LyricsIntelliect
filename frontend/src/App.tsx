import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Home from "./views/HomePage";

function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}

export default App;
