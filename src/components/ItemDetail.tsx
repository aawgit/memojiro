import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Editor from "react-simple-wysiwyg";
import "../styles/ItemDetail.css"; // Create this file for ItemDetail specific styles

interface ItemDetailProps {
  item: {
    title: string;
    description: string;
  };
  handleCloseClick: () => void;
  handleDescriptionChange: (newDescription: string) => void;
  saveOnCloud: (newDescription: string) => void; // New prop for saving to cloud
  loggedIn: boolean;
}

const ItemDetail: React.FC<ItemDetailProps> = ({
  item,
  handleCloseClick,
  handleDescriptionChange,
  saveOnCloud,
  loggedIn,
}) => {
  const [editedDescription, setEditedDescription] = useState(item.description);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setEditedDescription(item.description);
  }, [item.description]);

  const handleEditorChange = (newDescription: string) => {
    setEditedDescription(newDescription);
    setIsChanged(newDescription !== item.description);
    handleDescriptionChange(newDescription);
  };

  const handleSaveClick = () => {
    saveOnCloud(item.description);
    setIsChanged(false);
  };

  return (
    <>
      <h4 className="macos-section-title">{item.title}</h4>
      <Container className="large-text-area-container">
        <div className="close-button" onClick={handleCloseClick}>
          &times;
        </div>
        <Editor
          value={editedDescription}
          onChange={(e) => handleEditorChange(e.target.value)}
        />
        {loggedIn && (
          <button
            onClick={handleSaveClick}
            disabled={!isChanged}
            className="save-button"
          >
            {isChanged ? "Save" : "Saved..."}
          </button>
        )}
      </Container>
    </>
  );
};

export default ItemDetail;
