import React, { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useToast } from "../../hooks/useToast";

const CommentForm = ({ suggestionId, onCommentSubmit, isSubmitting }) => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [commentUsername, setCommentUsername] = useState("");
	const [commentText, setCommentText] = useState("");

	const handleSubmit = async (e) => {
		// Made function async
		e.preventDefault();
		if (!commentText.trim()) {
			showToast(t("commentTextLabel") + " " + t("errorIsEmpty"), "error");
			return;
		}
		try {
			await onCommentSubmit(suggestionId, {
				commentUsername: commentUsername.trim(),
				commentText: commentText.trim(),
			});
			setCommentText("");
		} catch (error) {
			console.error("Comment submission failed:", error);
		}
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
