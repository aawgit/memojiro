import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import "./App.css";

const App: React.FC = () => {
  const [inputVisible, setInputVisible] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [largeText, setLargeText] = useState("");

  const handleAddClick = () => {
    setInputVisible(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      (e.target as HTMLInputElement).value.trim() !== ""
    ) {
      setItems([...items, (e.target as HTMLInputElement).value]);
      setInputVisible(false);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const handleItemClick = (index: number) => {
    setEditingItem(index);
    setLargeText(items[index]);
  };

  const handleCloseClick = () => {
    setEditingItem(null);
    setLargeText("");
  };

  return (
    <Container>
      <div>
        <div className={`center ${editingItem !== null ? "shift-left" : ""}`}>
          <div className="plus-circle" onClick={handleAddClick}>
            +
          </div>
          {inputVisible && (
            <input
              type="text"
              className="input-field"
              onKeyDown={handleInputKeyDown}
              autoFocus
            />
          )}
          {items.map((item, index) => (
            <div
              key={index}
              className="item-rectangle"
              onClick={() => handleItemClick(index)}
            >
              {item}
            </div>
          ))}
        </div>
        {editingItem !== null && (
          <div className="large-text-area-container">
            <div className="close-button" onClick={handleCloseClick}>
              X
            </div>
            <textarea
              className="large-text-area"
              value={largeText}
              onChange={(e) => setLargeText(e.target.value)}
            />
          </div>
        )}
      </div>
    </Container>
  );
};

export default App;
