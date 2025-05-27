import React, { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";

const CommentForm = ({ suggestionId, onCommentSubmit, isSubmitting }) => {
	const { t } = useTranslation();
	const [commentUsername, setCommentUsername] = useState("");
	const [commentText, setCommentText] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!commentText.trim()) {
			alert(t("commentTextLabel") + " " + t("errorIsEmpty"));
			return;
		}
		onCommentSubmit(suggestionId, { commentUsername: commentUsername.trim(), commentText: commentText.trim() });
		setCommentText("");
	};

	return (
		<form onSubmit={handleSubmit} className="comment-form">
			<h3>{t("commentFormTitle")}</h3>
			<div className="form-group">
				<label htmlFor={`comment-username-${suggestionId}`}>{t("commentUsernameLabel")}</label>
				<input
					type="text"
					id={`comment-username-${suggestionId}`}
					value={commentUsername}
					onChange={(e) => setCommentUsername(e.target.value)}
					placeholder={t("suggestionsUsernamePlaceholder")}
				/>
			</div>
			<div className="form-group">
				<label htmlFor={`comment-text-${suggestionId}`}>{t("commentTextLabel")}</label>
				<textarea
					id={`comment-text-${suggestionId}`}
					value={commentText}
					onChange={(e) => setCommentText(e.target.value)}
					placeholder={t("suggestionsTextPlaceholder")}
					required
				/>
			</div>
			<button type="submit" className="tool-btn-secondary" disabled={isSubmitting}>
				{isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-comment-dots"></i>}{" "}
				{t("commentSubmitButton")}
			</button>
		</form>
	);
};

export default CommentForm;
