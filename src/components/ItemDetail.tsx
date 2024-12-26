import React, { useState, useEffect } from "react";
import {
  Editor,
  Toolbar,
  EditorProvider,
  BtnBulletList,
  BtnNumberedList,
  BtnLink,
} from "react-simple-wysiwyg";
import { Button } from "react-bootstrap";

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
      <EditorProvider>
        <Editor
          value={editedDescription}
          onChange={(e) => handleEditorChange(e.target.value)}
          // containerProps={{
          //   style: {
          //     background: "#406194",
          //     // borderRadius: "12px",
          //     border: "0px solid #ccc",
          //     color: "white"
          //   },
          // }}
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
