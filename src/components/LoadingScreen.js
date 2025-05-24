import React from "react";
import "../css/loading-screen.css";

const LoadingScreen = ({ fadingOut }) => {
	return (
		<div className={`loading-screen ${fadingOut ? "fade-out" : ""}`}>
			<i className="fas fa-tools fa-spin loading-icon"></i>
			<p className="loading-text">Loading WebTools...</p>
		</div>
	);
};

export default LoadingScreen;
