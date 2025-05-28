import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { usePageTransition } from "../hooks/usePageTransition";
import "../css/suggestions.css";

const SuggestToolPopup = ({ className }) => {
	const { t } = useTranslation();
	const { triggerPageTransition } = usePageTransition();
	const [isVisible, setIsVisible] = useState(false);

	useState(() => {
		const popupShown = sessionStorage.getItem("suggestToolPopupShown");

		setIsVisible(!popupShown);
	});

	const handleDismiss = () => {
		setIsVisible(false);
		sessionStorage.setItem("suggestToolPopupShown", "true");
	};

	const handleSuggest = (event) => {
		event.preventDefault();
		setIsVisible(false);
		sessionStorage.setItem("suggestToolPopupShown", "true");
		triggerPageTransition("/suggestions");
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div className={`suggestion-popup ${className}`}>
			<button onClick={handleDismiss} className="dismiss-btn" title={t("suggestToolPopupDismiss")}>
				<i className="fas fa-times"></i>
			</button>
			<div className="suggestion-popup-content">
				<p>
					<strong>{t("suggestToolPopupTitle")}</strong>
				</p>
				<p>{t("suggestionsPageSubtitle")}</p>
			</div>
			<div className="suggestion-popup-actions">
				<Link to="/suggestions" className="tool-btn" onClick={handleSuggest}>
					{t("suggestToolPopupButton")}
				</Link>
			</div>
		</div>
	);
};

export default SuggestToolPopup;
