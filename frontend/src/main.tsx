import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/index.css";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import router from "./configs/routes";
import queryClient from "./configs/query-client";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
				<App />
			</QueryClientProvider>
		</GoogleOAuthProvider>
	</StrictMode>,
);
