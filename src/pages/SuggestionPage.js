import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import SuggestionForm from "../components/suggestions/SuggestionForm";
import SuggestionList from "../components/suggestions/SuggestionList";
import { useToast } from "../hooks/useToast";

const API_BASE_URL = "https://web-tools-server.vercel.app";

const SuggestionPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [suggestions, setSuggestions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [sortOption, setSortOption] = useState("createdAtDesc");

	const fetchSuggestions = useCallback(async () => {
		if (suggestions.length === 0) {
			setIsLoading(true);
		}
		try {
			const response = await fetch(`${API_BASE_URL}/api/suggestions?sortBy=${sortOption}`);
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({
					message: t("errorAPI"),
				}));
				throw new Error(errorData.message || t("errorAPI") + ` (${response.status})`);
			}
			const data = await response.json();
			setSuggestions(data);
		} catch (err) {
			console.error("Fetch suggestions error:", err);
			showToast(err.message || t("errorNetwork"), "error");
		} finally {
			if (suggestions.length === 0) {
				setIsLoading(false);
			}
		}
	}, [t, sortOption, showToast, suggestions.length]);

	useEffect(() => {
		fetchSuggestions();
	}, [fetchSuggestions]);

	const handleSubmitSuggestion = async (suggestionData) => {
		setIsSubmitting(true);
		try {
			const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(suggestionData),
			});
			if (!response.ok) {
				const errData = await response.json().catch(() => ({
					message: t("errorAPI"),
				}));
				throw new Error(errData.message || t("errorAPI") + ` (${response.status})`);
			}
			showToast(t("suggestionSubmittedSuccess"), "success");
			fetchSuggestions();
		} catch (err) {
			console.error("Submit suggestion error:", err);
			showToast(err.message || t("errorNetwork"), "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVote = async (suggestionId, voteType, clientId) => {
		try {
			const response = await fetch(`${API_BASE_URL}/api/suggestions/${suggestionId}/vote`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ voteType, clientId }),
			});

			const responseText = await response.text();

			if (!response.ok) {
				let errorJsonMessage = t("errorAPI") + ` (Status: ${response.status})`;
				if (responseText) {
					try {
						const parsedError = JSON.parse(responseText);
						errorJsonMessage = parsedError.message || errorJsonMessage;
					} catch (e) {
						console.warn("Vote - Could not parse error response body as JSON:", responseText);
					}
				}
				throw new Error(errorJsonMessage);
			}

			if (!responseText) {
				console.error("Vote - Received 2xx response, but body is empty. This is unexpected.");
				showToast(t("errorAPI") + " (Empty success response from server)", "error");
				fetchSuggestions();
				return;
			}

			const updatedSuggestionFromServer = JSON.parse(responseText);

			setSuggestions((prevSuggestions) =>
				prevSuggestions.map((s) => (s._id === suggestionId ? updatedSuggestionFromServer : s))
			);
			showToast(t("suggestionVoteSuccess"), "success");
		} catch (err) {
			console.error("Vote - Error in handleVote:", err);
			if (err instanceof SyntaxError) {
				showToast(t("errorAPI") + " (Invalid data format from server)", "error");
			} else {
				showToast(err.message || t("errorNetwork"), "error");
			}
		}
	};

	const handleAddComment = async (suggestionId, commentData) => {
		try {
			const response = await fetch(`${API_BASE_URL}/api/suggestions/${suggestionId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(commentData),
			});

			const responseText = await response.text();

			if (!response.ok) {
				let errorJsonMessage = t("errorAPI") + ` (Status: ${response.status})`;
				if (responseText) {
					try {
						const parsedError = JSON.parse(responseText);
						errorJsonMessage = parsedError.message || errorJsonMessage;
					} catch (e) {
						console.warn("Comment - Could not parse error response body as JSON:", responseText);
					}
				}
				throw new Error(errorJsonMessage);
			}

			if (!responseText) {
				console.error("Comment - Received 2xx response, but body is empty. This is unexpected.");
				showToast(t("errorAPI") + " (Empty success response from server)", "error");
				fetchSuggestions();
				return;
			}

			const updatedSuggestionFromServer = JSON.parse(responseText);

			setSuggestions((prevSuggestions) =>
				prevSuggestions.map((s) => (s._id === suggestionId ? updatedSuggestionFromServer : s))
			);
			showToast(t("suggestionCommentSuccess"), "success");
		} catch (err) {
			console.error("Comment - Error in handleAddComment:", err);
			if (err instanceof SyntaxError) {
				showToast(t("errorAPI") + " (Invalid data format from server)", "error");
			} else {
				showToast(err.message || t("errorNetwork"), "error");
			}
			throw err;
		}
	};

	const handleSortChange = (event) => {
		setSortOption(event.target.value);
	};

	return (
		<div className="container suggestions-container">
			<header className="tool-header">
				<h1>{t("suggestionsPageTitle")}</h1>
				<p className="subtitle">{t("suggestionsPageSubtitle")}</p>
			</header>
			<main>
				<SuggestionForm onSubmitSuggestion={handleSubmitSuggestion} isSubmitting={isSubmitting} />
				{isLoading ? (
					<div className="loading-spinner-container">
						<i className="fas fa-spinner fa-spin"></i> {t("loading") || "Loading suggestions..."}
					</div>
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
