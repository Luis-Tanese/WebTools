import React, { createContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const showToast = useCallback((message, type = "info", duration = 5000) => {
		const id = uuidv4();
		setToasts((prevToasts) => [...prevToasts, { id, message, type, duration, progress: 100 }]);
	}, []);

	const dismissToast = useCallback((id) => {
		setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
	}, []);

	const updateToastProgress = useCallback((id, progress) => {
		setToasts((prevToasts) => prevToasts.map((toast) => (toast.id === id ? { ...toast, progress } : toast)));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast, dismissToast, toasts, updateToastProgress }}>
			{children}
		</ToastContext.Provider>
	);
};
