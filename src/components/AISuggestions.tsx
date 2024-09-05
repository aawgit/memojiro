import React from "react";
import { Form } from "react-bootstrap";
import AISuggestionsConfirmDialog from "./AISuggestionsConfirmDialog";
import "../styles/AISuggestions.css";

interface AISuggestionsProps {
  review: any;
  aiEnabled: boolean;
  updateAiEnabledStatus: (enabled: boolean) => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  review,
  aiEnabled,
  updateAiEnabledStatus,
  showConfirmDialog,
  setShowConfirmDialog,
}) => {
  // Convert Firestore timestamp to Date object
  const lastAnalyzedDate = new Date(review?.updated_at?.seconds * 1000);
  // console.log(review.upd);
  const handleToggle = () => {
    if (!aiEnabled) {
      if (!showConfirmDialog) {
        setShowConfirmDialog(true);
      }
    } else {
      updateAiEnabledStatus(false);
    }
  };

  const handleConfirm = () => {
    updateAiEnabledStatus(true);
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="ai-suggestions-container">
      <div className="ai-suggestions-header">
        <h5>Suggestions by AI</h5>
        <Form.Check
          type="switch"
          id="ai-toggle"
          label={aiEnabled ? "On" : "Off"}
          checked={aiEnabled}
          onChange={handleToggle}
        />
      </div>
      {showConfirmDialog && (
        <AISuggestionsConfirmDialog
          show={showConfirmDialog}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      {!aiEnabled && <p className="ai-suggestions-status">AI is turned off.</p>}
      {aiEnabled && Object.keys(review?.review).length === 0 && (
        <p className="ai-suggestions-status">No suggestions yet.</p>
      )}
      {aiEnabled && Object.keys(review?.review).length > 0 && (
        <div className="ai-suggestions-content">
          {review.review.urgent.length > 0 && (
            <div className="suggestion-block">
              <h6>These tasks seem important! Should we handle them today?</h6>
              <ul>
                {review.review.urgent.map((task: string, index: number) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>
          )}

          {review.review.easy.length > 0 && (
            <div className="suggestion-block">
              <h6>These tasks seem easy! Maybe tackle them first?</h6>
              <ul>
                {review.review.easy.map((task: string, index: number) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Display last analyzed time */}
          <div>
            <p style={{ fontStyle: "italic", marginTop: "10px" }}>
              Last analyzed on:{" "}
              {lastAnalyzedDate.toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
