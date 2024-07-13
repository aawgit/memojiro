import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import {
  Editor,
  Toolbar,
  EditorProvider,
  BtnBulletList,
  BtnNumberedList,
  BtnLink,
} from "react-simple-wysiwyg";
import "../styles/ItemDetail.css"; // Create this file for ItemDetail specific styles
import { Button } from "react-bootstrap";

interface ItemDetailProps {
  item: {
    title: string;
    description: string;
  };
  handleCloseClick: () => void;
  handleDescriptionChange: (newDescription: string) => void;
  saveOnCloud: (newDescription: string) => void; // New prop for saving to cloud
  loggedIn: boolean;
  isMobile: boolean;
}

const ItemDetail: React.FC<ItemDetailProps> = ({
  item,
  handleCloseClick,
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
    saveOnCloud(item.description);
    setIsChanged(false);
  };

  return (
    <>
      {!isMobile && <h4 className="macos-section-title">{item.title}</h4>}
      {isMobile && <br></br>}
      {/* <Container className="large-text-area-container"> */}
      <div className="close-button" onClick={handleCloseClick}>
        &times;
      </div>
      <EditorProvider>
        <Editor
          value={editedDescription}
          onChange={(e) => handleEditorChange(e.target.value)}
          containerProps={{
            style: {
              background: "white",
              // borderRadius: "12px",
              border: "1px solid #ccc",
            },
          }}
        >
          <Toolbar>
            <BtnBulletList />
            <BtnNumberedList />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
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
