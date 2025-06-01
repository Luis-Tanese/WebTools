import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import "../css/mania-dan-calculator.css";

const MIN_MAPS = 2;
const DEFAULT_MAPS = 4;

const exampleData = [
	{ overallAvg: 96.34, notes: 2128 },
	{ overallAvg: 95.72, notes: 2554 },
	{ overallAvg: 95.43, notes: 2194 },
	{ overallAvg: 96.19, notes: 2830 },
];

const ManiaDanCalculatorPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();

	const [maps, setMaps] = useState(() => {
		const initialMaps = [];
		for (let i = 0; i < DEFAULT_MAPS; i++) {
			initialMaps.push({
				id: i + 1,
				overallAvg: exampleData[i] ? exampleData[i].overallAvg : null,
				notes: exampleData[i] ? exampleData[i].notes : null,
				error: { overallAvg: false, notes: false },
			});
		}
		return initialMaps;
	});

	const [nextMapId, setNextMapId] = useState(DEFAULT_MAPS + 1);
	const [showResults, setShowResults] = useState(false);

	const addMap = useCallback(() => {
		setMaps((prevMaps) => [
			...prevMaps,
			{
				id: nextMapId,
				overallAvg: null,
				notes: null,
				error: { overallAvg: false, notes: false },
			},
		]);
		setNextMapId((prevId) => prevId + 1);
		setShowResults(false);
	}, [nextMapId]);

	const removeMap = useCallback(
		(idToRemove) => {
			setMaps((prevMaps) => {
				if (prevMaps.length <= MIN_MAPS) {
					showToast(t("mdcErrorMinMaps", { minMaps: MIN_MAPS }), "info");
					return prevMaps;
				}
				const updatedMaps = prevMaps.filter((map) => map.id !== idToRemove);
				setShowResults(false);
				return updatedMaps;
			});
		},
		[t, showToast]
	);

	const handleInputChange = useCallback((id, field, value) => {
		setMaps((prevMaps) =>
			prevMaps.map((map) => {
				if (map.id === id) {
					let parsedValue;
					if (value === "") {
						parsedValue = null;
					} else if (field === "overallAvg") {
						parsedValue = parseFloat(value);
					} else if (field === "notes") {
						parsedValue = parseInt(value, 10);
					}

					return {
						...map,
						[field]: parsedValue,
						error: { ...map.error, [field]: false },
					};
				}
				return map;
			})
		);
		setShowResults(false);
	}, []);

	const calculateScores = useCallback(() => {
		let isValid = true;
		const currentMapsForCalculation = maps.map((map) => {
			const overallAvg = map.overallAvg;
			const notes = map.notes;

			let newError = { overallAvg: false, notes: false };

			if (overallAvg === null || isNaN(overallAvg) || overallAvg < 0 || overallAvg > 100) {
				newError.overallAvg = true;
				isValid = false;
			}
			if (notes === null || isNaN(notes) || notes <= 0) {
				newError.notes = true;
				isValid = false;
			}
			return { ...map, error: newError };
		});

		setMaps(currentMapsForCalculation);

		if (!isValid) {
			showToast(t("mdcErrorInvalidInput"), "error");
			setShowResults(false);
			return;
		}

		const individualScores = [];
		let cumulativeTotalNotes = 0;
		let cumulativeAchievedScorePoints = 0;

		for (let k = 0; k < maps.length; k++) {
			const currentMapNotes = maps[k].notes;
			const currentOverallAverage = maps[k].overallAvg;

			const totalNotesUpToCurrentMap = cumulativeTotalNotes + currentMapNotes;
			const totalAchievedScorePointsUpToCurrentMap = (currentOverallAverage / 100) * totalNotesUpToCurrentMap;

			let achievedScorePointsForCurrentMap;
			if (k === 0) {
				achievedScorePointsForCurrentMap = totalAchievedScorePointsUpToCurrentMap;
			} else {
				achievedScorePointsForCurrentMap =
					totalAchievedScorePointsUpToCurrentMap - cumulativeAchievedScorePoints;
			}

			const individualScore =
				currentMapNotes === 0 ? 0 : (achievedScorePointsForCurrentMap / currentMapNotes) * 100;
			individualScores.push(individualScore);

			cumulativeTotalNotes = totalNotesUpToCurrentMap;
			cumulativeAchievedScorePoints = totalAchievedScorePointsUpToCurrentMap;
		}

		setMaps((prevMaps) =>
			prevMaps.map((map, index) => ({
				...map,
				individualScore: individualScores[index],
			}))
		);
		showToast(t("mdcCalculatedSuccess"), "success");
		setShowResults(true);
	}, [maps, t, showToast]);

	useEffect(() => {
		if (showResults) {
			const resultsElement = document.getElementById("mdc-results-area");
			if (resultsElement) {
				requestAnimationFrame(() => {
					resultsElement.scrollIntoView({ behavior: "smooth", block: "end" });
				});
			}
		}
	}, [showResults]);

	return (
		<div className="container">
			<header className="tool-header">
				<h1>{t("mdcPageTitle")}</h1>
				<p className="subtitle">
					{t("mdcDescription")}
					<strong>{t("mdcOverallAccuracy")}</strong> {t("mdcOverallAccuracy2")}
					<strong>{t("mdcTotalNotes")}</strong> {t("mdcTotalNotes2")}
				</p>
				<div className="mdc-important-note">
					<i className="fa-solid fa-triangle-exclamation"></i>
					<span>{t("mdcImportantNote")}</span>
				</div>
			</header>

			<div className="mdc-actions">
				<button onClick={addMap} className="tool-btn">
					<i className="fa-solid fa-plus"></i>
					{t("mdcAddMap")}
				</button>
				<button onClick={calculateScores} className="tool-btn">
					<i className="fa-solid fa-calculator"></i>
					{t("mdcCalculateScores")}
				</button>
			</div>

			<div className="mdc-maps-container">
				{maps.map((map, index) => (
					<div key={map.id} className="mdc-map-card">
						<div className="mdc-map-header">
							<span className="mdc-map-title">{t("mdcMapNumber", { mapNumber: index + 1 })}</span>
							<button
								className="tool-btn-secondary mdc-remove-btn"
								onClick={() => removeMap(map.id)}
								title={t("mdcRemoveMapTitle", { mapNumber: index + 1 })}
								disabled={maps.length <= MIN_MAPS}
							>
								<i className="fa-solid fa-trash-can"></i>
							</button>
						</div>
						<div className="mdc-inputs-grid">
							<div className="mdc-input-group">
								<label htmlFor={`overall-avg-${map.id}`} className="mdc-input-label">
									{t("mdcOverallAvgLabel")}
								</label>
								<input
									type="number"
									id={`overall-avg-${map.id}`}
									className={`mdc-input-field ${map.error.overallAvg ? "error" : ""}`}
									step="0.0001"
									placeholder="96.34"
									value={map.overallAvg === null ? "" : map.overallAvg}
									onChange={(e) => handleInputChange(map.id, "overallAvg", e.target.value)}
									required
								/>
							</div>
							<div className="mdc-input-group">
								<label htmlFor={`notes-${map.id}`} className="mdc-input-label">
									{t("mdcNotesInMapLabel")}
								</label>
								<input
									type="number"
									id={`notes-${map.id}`}
									className={`mdc-input-field ${map.error.notes ? "error" : ""}`}
									step="1"
									placeholder="2128"
									value={map.notes === null ? "" : map.notes}
									onChange={(e) => handleInputChange(map.id, "notes", e.target.value)}
									required
								/>
							</div>
						</div>
					</div>
				))}
			</div>

			<div id="mdc-results-area" className={`mdc-results ${showResults ? "is-visible" : "is-hidden"}`}>
				<h2>
					<i className="fa-solid fa-chart-line"></i>
					{t("mdcIndividualMapPercentages")}
				</h2>
				<ul className="mdc-results-list">
					{maps.map((map, index) => (
						<li key={map.id} className="mdc-result-item">
							<span className="mdc-result-label">
								{t("mdcMapNumber", { mapNumber: index + 1 })} ({map.notes} {t("mdcNotes")})
							</span>
							<span className="mdc-result-value">
								{map.individualScore !== undefined && !isNaN(map.individualScore)
									? `${map.individualScore.toFixed(2)}%`
									: t("mdcNA")}
							</span>
						</li>
					))}
				</ul>

				<h3>
					<i className="fa-solid fa-check-circle"></i>
					{t("mdcVerification")}
				</h3>
				<ul className="mdc-verification-list">
					{(() => {
						let runningTotalNotes = 0;
						let runningAchievedScorePoints = 0;
						return maps.map((map, index) => {
							const currentMapOverallAvg = typeof map.overallAvg === "number" ? map.overallAvg : 0;
							const currentMapNotes = typeof map.notes === "number" ? map.notes : 0;
							const currentMapIndividualScore =
								typeof map.individualScore === "number" ? map.individualScore : 0;

							runningTotalNotes += currentMapNotes;
							runningAchievedScorePoints += (currentMapIndividualScore / 100) * currentMapNotes;

							let calculatedOverallAvg =
								runningTotalNotes === 0 ? 0 : (runningAchievedScorePoints / runningTotalNotes) * 100;

							return (
								<li key={`verify-${map.id}`} className="mdc-verification-item">
									<span className="mdc-verification-label">
										{t("mdcOverallAfterMap", { mapNumber: index + 1 })}
									</span>
									<span className="mdc-verification-value">
										{calculatedOverallAvg.toFixed(2)}% ({t("mdcGiven")}:{" "}
										{currentMapOverallAvg.toFixed(2)}%)
									</span>
								</li>
							);
						});
					})()}
				</ul>
			</div>
		</div>
	);
};

export default ManiaDanCalculatorPage;
