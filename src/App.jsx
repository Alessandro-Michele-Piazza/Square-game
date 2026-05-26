import { RouterProvider } from "react-router";
import "aos/dist/aos.css";
import router from "./router/router";
import { UserContextProvider } from "./context/UserContext";

function RootFallback() {
  return (
    <div className="loading_page">
      <div className="loading_spinner"></div>
    </div>
  );
}

export default function App() {
  return (
    <UserContextProvider>
      <RouterProvider router={router} hydrateFallbackElement={<RootFallback />} />
    </UserContextProvider>
  );
}
