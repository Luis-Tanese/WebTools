import React, { useEffect, useState } from "react";
import { usePageTransition } from "../hooks/usePageTransition";
import { useLocation } from "react-router-dom";
import "../css/page-transition.css";

const PageTransitionWrapper = ({ children }) => {
	const { isTransitioning, setIsTransitioning } = usePageTransition();
	const location = useLocation();
	const [localIsFadingIn, setLocalIsFadingIn] = useState(false);

	useEffect(() => {
		setLocalIsFadingIn(true);

		const resetGlobalTransition = setTimeout(() => {
			setIsTransitioning(false);
		}, 300);

		return () => {
			clearTimeout(resetGlobalTransition);
			setLocalIsFadingIn(false);
		};
	}, [location.pathname, setIsTransitioning]);

	return (
		<div className={`page-transition-wrapper ${isTransitioning ? "fade-out" : localIsFadingIn ? "fade-in" : ""}`}>
			{children}
		</div>
	);
};

export default PageTransitionWrapper;
