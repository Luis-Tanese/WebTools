import React, { useEffect, useRef, useCallback } from "react";
import { useToast } from "../hooks/useToast";
import "../css/toast.css";

const ToastNotification = ({ id, message, type, duration, progress }) => {
	const { dismissToast, updateToastProgress } = useToast();
	const intervalRef = useRef(null);
	const startTimeRef = useRef(Date.now());

	const startProgress = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		startTimeRef.current = Date.now();
		intervalRef.current = setInterval(() => {
			const elapsed = Date.now() - startTimeRef.current;
			const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
			updateToastProgress(id, newProgress);
			if (newProgress <= 0) {
				clearInterval(intervalRef.current);
				dismissToast(id);
			}
		}, 50);
	}, [duration, id, updateToastProgress, dismissToast]);

	useEffect(() => {
		startProgress();

		return () => {
			clearInterval(intervalRef.current);
		};
	}, [startProgress]);

	const handleMouseEnter = () => {
		clearInterval(intervalRef.current);
	};

	const handleMouseLeave = () => {
		const remainingDuration = duration * (progress / 100);
		startTimeRef.current = Date.now() - (duration - remainingDuration);
		startProgress();
	};

	return (
		<div
			className={`toast toast-${type}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={{ "--toast-duration": `${duration / 1000}s` }} 
		>
			<div className="toast-content">
				<span className="toast-message">{message}</span>
				<button className="toast-close-btn" onClick={() => dismissToast(id)}>
					<i className="fas fa-times"></i>
				</button>
			</div>
			<div className="toast-progress-bar" style={{ width: `${progress}%` }}></div>
		</div>
	);
};

export default ToastNotification;
