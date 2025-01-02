import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import CustomEditor from "./CustomEditor";

interface ItemDetailProps {
  item: {
    title: string;
    description: string;
  };
  // handleCloseClick: () => void;
  handleDescriptionChange: (newDescription: string) => void;
  saveOnCloud: () => void; // New prop for saving to cloud
  loggedIn: boolean;
  isMobile: boolean;
}

const ItemDetail: React.FC<ItemDetailProps> = ({
  item,
  // handleCloseClick,
  handleDescriptionChange,
  saveOnCloud,
  loggedIn,
  isMobile,
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
    saveOnCloud();
    setIsChanged(false);
  };

  return (
    <>

      {/* <Container className="large-text-area-container"> */}
      {/* <div className="close-button" onClick={handleCloseClick}>
        &times;
      </div> */}
      <CustomEditor
  value={editedDescription}
  onChange={handleEditorChange}
/>
      {/* </Container> */}
      <br></br>
      {loggedIn && (
        <Button
          onClick={handleSaveClick}
          disabled={!isChanged}
          variant="primary"
        >
          {isChanged ? "Save" : "Saved..."}
        </Button>
      )}
    </>
  );
};

export default ItemDetail;
