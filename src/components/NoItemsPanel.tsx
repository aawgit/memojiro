import React from "react";

interface Props {
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const NoItemsPanel: React.FC<Props> = ({ handleInputKeyDown }) => (
  <div
    className="macos-panel"
    style={{ width: "300px", height: "300px", margin: "auto" }}
  >
    <h5>Memojiro is an app for taking notes.</h5>

    <input
      type="text"
      className="input-field"
      onKeyDown={handleInputKeyDown}
      placeholder="Add your first note title here..."
      autoFocus
      // style={{ borderColor: "#ff6600" }}
    />
  </div>
);

export default NoItemsPanel;
