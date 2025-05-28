import React from "react";
import ReactDOM from "react-dom/client";
import "./css/root.css";
import "./css/index.css";
import "./css/index-media.css";
import "./css/page-transition.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
