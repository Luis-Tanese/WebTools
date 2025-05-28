import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { usePageTransition } from "../hooks/usePageTransition";
import "../css/root.css";

const BackButton = ({ className }) => {
	const { t } = useTranslation();
	const { triggerPageTransition } = usePageTransition();

	const handleClick = (event) => {
		event.preventDefault();
		triggerPageTransition("/");
	};

	return (
		<Link to="/" onClick={handleClick} className={`back-button ${className}`} title={t("backButtonTitle")}>
			<i className="fas fa-arrow-left"></i>
		</Link>
	);
};

export default BackButton;
