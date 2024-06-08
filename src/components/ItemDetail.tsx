import React from "react";
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
}

const ItemDetail: React.FC<ItemDetailProps> = ({
  item,
  handleCloseClick,
  handleDescriptionChange,
}) => {
  return (
    <>
      <h4 className="macos-section-title">{item.title}</h4>
      <Container className="large-text-area-container">
        <div className="close-button" onClick={handleCloseClick}>
          &times;
        </div>
        <Editor
          value={item.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
        />
      </Container>
    </>
  );
};

export default ItemDetail;
