import React from "react";
import { useTranslation } from "../../hooks/useTranslation";

const CommentList = ({ comments }) => {
	const { t } = useTranslation();

	if (!comments || comments.length === 0) {
		return <p>{t("suggestionsNoComments")}</p>;
	}

	const formatDate = (dateString) => {
		if (!dateString) return "";
		try {
			return new Date(dateString).toLocaleDateString(undefined, {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			return dateString;
		}
	};

	return (
		<div className="comments-list">
			{comments.map((comment) => (
				<div key={comment._id || comment.commentCreatedAt} className="comment-item">
					<div className="comment-item-header">
						<span className="comment-item-user">{comment.commentUsername || t("anonymousUser")}</span>
						<span className="comment-item-date">{formatDate(comment.commentCreatedAt)}</span>
					</div>
					<p className="comment-item-text">{comment.commentText}</p>
				</div>
			))}
		</div>
	);
};

export default CommentList;
