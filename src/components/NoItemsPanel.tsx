import React from "react";

interface Props {
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const NoItemsPanel: React.FC<Props> = ({ handleInputKeyDown }) => (
  <div className="no-items-container">
    <p>Memojiro is an app for taking notes.</p>

    <input
      type="text"
      className="input-field"
      onKeyDown={handleInputKeyDown}
      placeholder="Add your first note title here..."
      autoFocus
      style={{ borderColor: "#ff6600" }}
    />
  </div>
);

export default NoItemsPanel;
