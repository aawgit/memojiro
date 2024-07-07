import React from "react";

interface Props {
  handleAddClick: () => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  //   setInputVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const NoItemsPanel: React.FC<Props> = ({
  handleAddClick,
  handleInputKeyDown,
  //   setInputVisible,
}) => (
  <div className="no-items-container">
    <p>Memojiro is an app for taking notes.</p>

    <input
      type="text"
      className="input-field"
      onKeyDown={handleInputKeyDown}
      placeholder="Note title goes here..."
      autoFocus
      style={{ borderColor: "#ff6600" }}
    />
  </div>
);

export default NoItemsPanel;
