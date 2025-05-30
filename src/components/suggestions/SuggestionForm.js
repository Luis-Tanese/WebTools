import React, { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useToast } from "../../hooks/useToast";

const SuggestionForm = ({ onSubmitSuggestion, isSubmitting }) => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [username, setUsername] = useState("");
	const [suggestionText, setSuggestionText] = useState("");

	const handleSubmit = async (e) => {
		// Made function async
		e.preventDefault();
		if (!suggestionText.trim()) {
			showToast(t("suggestionsTextLabel") + " " + t("errorIsEmpty"), "error");
			return;
		}
		try {
			await onSubmitSuggestion({ username: username.trim(), text: suggestionText.trim() });
			setSuggestionText("");
		} catch (error) {
			console.error("Suggestion submission failed:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="suggestion-form">
			<h2>{t("suggestionsFormTitle")}</h2>
			<div className="form-group">
				<label htmlFor="suggestion-username">{t("suggestionsUsernameLabel")}</label>
				<input
					type="text"
					id="suggestion-username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder={t("suggestionsUsernamePlaceholder")}
				/>
			</div>
			<div className="form-group">
				<label htmlFor="suggestion-text">{t("suggestionsTextLabel")}</label>
				<textarea
					id="suggestion-text"
					value={suggestionText}
					onChange={(e) => setSuggestionText(e.target.value)}
					placeholder={t("suggestionsTextPlaceholder")}
					required
				/>
			</div>
			<button type="submit" className="tool-btn" disabled={isSubmitting}>
				{isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}{" "}
				{t("suggestionsSubmitButton")}
			</button>
		</form>
	);
};

export default SuggestionForm;
