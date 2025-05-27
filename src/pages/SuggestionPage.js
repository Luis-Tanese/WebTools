import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import SuggestionForm from "../components/suggestions/SuggestionForm";
import SuggestionList from "../components/suggestions/SuggestionList";
import BackButton from "../components/BackButton";
import "../css/suggestions.css";

const API_BASE_URL = "https://web-tools-server.vercel.app";

const SuggestionPage = () => {
	const { t } = useTranslation();
	const [suggestions, setSuggestions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [sortOption, setSortOption] = useState("createdAtDesc");

	const fetchSuggestions = useCallback(async () => {
		setIsLoading(true);
		setError("");
		try {
			const response = await fetch(`${API_BASE_URL}/api/suggestions?sortBy=${sortOption}`);
			if (!response.ok) {
				throw new Error(t("errorAPI") + ` (${response.status})`);
			}
			const data = await response.json();
			setSuggestions(data);
		} catch (err) {
			console.error("Fetch suggestions error:", err);
			setError(err.message || t("errorNetwork"));
		} finally {
			setIsLoading(false);
		}
	}, [t, sortOption]);

	useEffect(() => {
		fetchSuggestions();
	}, [fetchSuggestions]);

	const handleSubmitSuggestion = async (suggestionData) => {
		setIsSubmitting(true);
		setError("");
		setSuccessMessage("");
		try {
			const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(suggestionData),
			});
			if (!response.ok) {
				const errData = await response.json().catch(() => ({ message: t("errorAPI") }));
				throw new Error(errData.message || t("errorAPI") + ` (${response.status})`);
			}
			setSuccessMessage(t("suggestionSubmittedSuccess"));
			fetchSuggestions();
		} catch (err) {
			console.error("Submit suggestion error:", err);
			setError(err.message || t("errorNetwork"));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVote = async (suggestionId, voteType, clientId) => {
		setError("");
		setSuccessMessage("");
		try {
			const response = await fetch(`${API_BASE_URL}/api/suggestions/${suggestionId}/vote`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ voteType, clientId }),
			});
			if (!response.ok) {
				const errData = await response.json().catch(() => ({ message: t("errorAPI") }));
				throw new Error(errData.message || t("errorAPI") + ` (${response.status})`);
			}
			const updatedSuggestion = await response.json();
			setSuggestions((prev) => prev.map((s) => (s._id === suggestionId ? updatedSuggestion : s)));
			setSuccessMessage(t("suggestionVoteSuccess"));
		} catch (err) {
			console.error("Vote error:", err);
			setError(err.message || t("errorNetwork"));
		}
	};

	const handleAddComment = async (suggestionId, commentData) => {
		setError("");
		setSuccessMessage("");
		try {
			const response = await fetch(`${API_BASE_URL}/api/suggestions/${suggestionId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(commentData),
			});
			if (!response.ok) {
				const errData = await response.json().catch(() => ({ message: t("errorAPI") }));
				throw new Error(errData.message || t("errorAPI") + ` (${response.status})`);
			}
			const updatedSuggestion = await response.json();
			setSuggestions((prev) => prev.map((s) => (s._id === suggestionId ? updatedSuggestion : s)));
			setSuccessMessage(t("suggestionCommentSuccess"));
		} catch (err) {
			console.error("Add comment error:", err);
			setError(err.message || t("errorNetwork"));
			throw err;
		}
	};

	const handleSortChange = (event) => {
		setSortOption(event.target.value);
	};

	return (
        
		<div className="container suggestions-container">
            <BackButton></BackButton>
			<header className="tool-header">
				<h1>{t("suggestionsPageTitle")}</h1>
				<p className="subtitle">{t("suggestionsPageSubtitle")}</p>
			</header>
			<main>
				{successMessage && <p className="status-message-global success">{successMessage}</p>}
				{error && <p className="status-message-global error">{error}</p>}

				<SuggestionForm onSubmitSuggestion={handleSubmitSuggestion} isSubmitting={isSubmitting} />

				{isLoading ? (
					<p>{t("loading") || "Loading suggestions..."}</p>
				) : (
					<SuggestionList
						suggestions={suggestions}
						onVote={handleVote}
						onAddComment={handleAddComment}
						sortOption={sortOption}
						onSortChange={handleSortChange}
					/>
				)}
				<p className="client-id-info">{t("suggestionClientId")}</p>
			</main>
		</div>
	);
};

export default SuggestionPage;
