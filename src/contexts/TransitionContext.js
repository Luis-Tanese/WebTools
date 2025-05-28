import React, { createContext, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
	const [isTransitioning, setIsTransitioning] = useState(false);
	const navigate = useNavigate();
	const transitionTimeoutRef = useRef(null);

	const triggerPageTransition = useCallback(
		(to, delay = 300) => {
			if (transitionTimeoutRef.current) {
				clearTimeout(transitionTimeoutRef.current);
			}
			setIsTransitioning(true);
			transitionTimeoutRef.current = setTimeout(() => {
				navigate(to);
			}, delay);
		},
		[navigate]
	);

	return (
		<TransitionContext.Provider value={{ isTransitioning, setIsTransitioning, triggerPageTransition }}>
			{children}
		</TransitionContext.Provider>
	);
};
