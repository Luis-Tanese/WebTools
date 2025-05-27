import React from "react";
import SuggestionItem from "./SuggestionItem";
import { useTranslation } from "../../hooks/useTranslation";

const SuggestionList = ({ suggestions, onVote, onAddComment, onUpdateSuggestion, sortOption, onSortChange }) => {
	const { t } = useTranslation();

	if (!suggestions || suggestions.length === 0) {
		return <p className="no-tools-message">{t("suggestionsNoSuggestions")}</p>;
	}

	return (
		<div className="suggestions-list-container">
			<div className="suggestions-list-header">
				<h2>{t("suggestionsListTitle")}</h2>
				<div className="suggestions-sort-controls">
					<label htmlFor="sort-suggestions">{t("suggestionsSortBy")}</label>
					<select id="sort-suggestions" value={sortOption} onChange={onSortChange}>
						<option value="createdAtDesc">{t("suggestionsSortRecent")}</option>
						<option value="likesDesc">{t("suggestionsSortLikes")}</option>
					</select>
				</div>
			</div>
			{suggestions.map((suggestion) => (
				<SuggestionItem
					key={suggestion._id}
					suggestion={suggestion}
					onVote={onVote}
					onAddComment={onAddComment}
					onUpdateSuggestion={onUpdateSuggestion}
				/>
			))}
		</div>
	);
};

export default SuggestionList;
