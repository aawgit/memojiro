import React from "react";
import { Modal, Button } from "react-bootstrap";

interface AISuggestionsConfirmDialogProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AISuggestionsConfirmDialog: React.FC<AISuggestionsConfirmDialogProps> = ({
  show,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Enable AI Suggestions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Enabling AI suggestions will share your notes with an external AI model
        to provide personalized recommendations. Is that alright?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          No
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Yes, enable AI suggestions
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AISuggestionsConfirmDialog;
