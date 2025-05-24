import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import "../css/root.css";

const BackButton = () => {
	const { t } = useTranslation();
	return (
		<Link to="/" className="back-button" title={t("backButtonTitle")}>
			<i className="fas fa-arrow-left"></i>
		</Link>
	);
};

export default BackButton;
