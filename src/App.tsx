import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import "./App.css";

const App: React.FC = () => {
  const [inputVisible, setInputVisible] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [largeText, setLargeText] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    setItems(reorderedItems);
  };

  const handleDeleteClick = (index: number) => {
    setItemToDelete(index);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      const newItems = items.filter((_, i) => i !== itemToDelete);
      setItems(newItems);
      setShowConfirmDialog(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setItemToDelete(null);
  };

  return (
    <div className="App">
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {items.map((item, index) => (
                  <Draggable
                    key={index}
                    draggableId={index.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="item-rectangle"
                      >
                        <span onClick={() => handleItemClick(index)}>
                          {item}
                        </span>
                        <span
                          className="delete-icon"
                          onClick={() => handleDeleteClick(index)}
                        >
                          🗑️
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <p>Are you sure?</p>
            <button onClick={handleConfirmDelete}>Yes</button>
            <button onClick={handleCancelDelete}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
