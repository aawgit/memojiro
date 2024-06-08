import React from "react";
import "../styles/ConfirmDialog.css"; // Create this file for ConfirmDialog specific styles

interface ConfirmDialogProps {
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  handleConfirmDelete,
  handleCancelDelete,
}) => {
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <p>Are you sure?</p>
        <button onClick={handleConfirmDelete}>Yes</button>
        <button onClick={handleCancelDelete}>No</button>
      </div>
    </div>
  );
};

export default ConfirmDialog;
