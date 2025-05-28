import React from "react";
import { useToast } from "../hooks/useToast";
import ToastNotification from "./ToastNotification";
import "../css/toast.css";

const ToastContainer = () => {
	const { toasts } = useToast();

	return (
		<div className="toast-container">
			{toasts.map((toast) => (
				<ToastNotification key={toast.id} {...toast} />
			))}
		</div>
	);
};

export default ToastContainer;
