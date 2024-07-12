import React from "react";
import "../styles/ConfirmDialog.css"; // Create this file for ConfirmDialog specific styles

interface ConfirmDialogProps {
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
  title: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  handleConfirmDelete,
  handleCancelDelete,
  title,
}) => {
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <p>Are you sure you want to delete "{title}"?</p>
        <button onClick={handleConfirmDelete}>Yes</button>
        <button onClick={handleCancelDelete}>No</button>
      </div>
    </div>
  );
};

export default ConfirmDialog;
