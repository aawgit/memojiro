import React, { useState } from "react";

interface Props {
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const NoItemsPanel: React.FC<Props> = ({ handleInputKeyDown }) => {
  const [noteTitle, setNoteTitle] = useState("");

  const handleSaveClick = () => {
    if (noteTitle.trim()) {
      // Create a synthetic "Enter" key press event
      const syntheticEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });

      // Set the value and trigger the keydown handler
      const inputElement = document.querySelector(
        ".input-field"
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = noteTitle;
        inputElement.dispatchEvent(syntheticEvent);
        setNoteTitle(""); // Clear the input field after saving
      }
    }
  };

  return (
    <div
      className="app-panel-no-items"
      style={{ width: "300px", margin: "auto" }}
    >
      <h5>Memojiro is an app for taking notes. It's free.</h5>

      <input
        type="text"
        className="input-field"
        onKeyDown={(e) => {
          handleInputKeyDown(e);
          if (e.key === "Enter" && noteTitle.trim()) {
            setNoteTitle("");
          }
        }}
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Add your first note title here..."
        autoFocus
      />
      <button
        onClick={handleSaveClick}
        className="save-button"
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          borderRadius: "4px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
};

export default NoItemsPanel;
