import React, { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

const getClientId = () => {
	let clientId = localStorage.getItem("webtools_clientId");
	if (!clientId) {
		clientId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		localStorage.setItem("webtools_clientId", clientId);
	}
	return clientId;
};

const SuggestionItem = ({ suggestion, onVote, onAddComment, onUpdateSuggestion }) => {
	const { t, language } = useTranslation();
	const [showComments, setShowComments] = useState(false);
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);

	const [clientId, setClientId] = useState("");

	useEffect(() => {
		setClientId(getClientId());
	}, []);

	const handleVote = (voteType) => {
		if (!clientId) return;
		onVote(suggestion._id, voteType, clientId);
	};

	const handleCommentSubmit = async (suggestionId, commentData) => {
		setIsSubmittingComment(true);
		try {
			await onAddComment(suggestionId, commentData);
		} catch (error) {
		} finally {
			setIsSubmittingComment(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "";
		try {
			return new Date(dateString).toLocaleDateString(language.replace("_", "-"), {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch (e) {
			return dateString;
		}
	};

	const hasLiked = suggestion.likedBy && suggestion.likedBy.includes(clientId);
	const hasDisliked = suggestion.dislikedBy && suggestion.dislikedBy.includes(clientId);

	return (
		<div className="suggestion-item">
			<div className="suggestion-item-header">
				<span className="suggestion-item-user">
					{t("postedBy", {
						username: suggestion.username || t("anonymousUser"),
						date: formatDate(suggestion.createdAt),
					})}
				</span>
			</div>
			<p className="suggestion-item-text">{suggestion.text}</p>
			<div className="suggestion-item-actions">
				<button
					onClick={() => handleVote("like")}
					className={`vote-btn ${hasLiked ? "liked" : ""}`}
					disabled={!clientId}
					title={t("suggestionLikes")}
				>
					<i className={`fas fa-thumbs-up ${hasLiked ? "active" : ""}`}></i> {suggestion.likes || 0}
				</button>
				<button
					onClick={() => handleVote("dislike")}
					className={`vote-btn ${hasDisliked ? "disliked" : ""}`}
					disabled={!clientId}
					title={t("suggestionDislikes")}
				>
					<i className={`fas fa-thumbs-down ${hasDisliked ? "active" : ""}`}></i> {suggestion.dislikes || 0}
				</button>
				<button onClick={() => setShowComments(!showComments)} className="tool-btn-secondary comments-toggle">
					<i className={`fas ${showComments ? "fa-comment-slash" : "fa-comments"}`}></i>{" "}
					{showComments ? t("suggestionHideComments") : t("suggestionViewComments")} (
					{(suggestion.comments && suggestion.comments.length) || 0})
				</button>
			</div>

			{showComments && (
				<div className="comments-section">
					<CommentList comments={suggestion.comments || []} />
					<CommentForm
						suggestionId={suggestion._id}
						onCommentSubmit={handleCommentSubmit}
						isSubmitting={isSubmittingComment}
					/>
				</div>
			)}
		</div>
	);
};

export default SuggestionItem;
