import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import "./App.css";
import { Alert } from "react-bootstrap";
import { setLocal, getLocal } from "./hooks/usePersistentState";
import NavBarC from "./components/navbar";

interface item {
  title: string;
  description: string;
}

const App: React.FC = () => {
  const [inputVisible, setInputVisible] = useState(false);
  //@ts-ignore
  const [show, setShow] = useState(true);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [items, setItems] = useState<item[]>(() => {
    // Load state from localStorage if available
    const savedItems = getLocal("items");
    return savedItems ? savedItems : [];
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    setLocal("items", items);
  }, [items]);

  const handleAddClick = () => {
    setInputVisible(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      (e.target as HTMLInputElement).value.trim() !== ""
    ) {
      setItems([
        ...items,
        { title: (e.target as HTMLInputElement).value, description: "" },
      ]);
      setInputVisible(false);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const handleDescriptionChange = (index: number, newDescription: string) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, description: newDescription } : item
    );
    setItems(updatedItems);
  };

  const handleItemClick = (index: number) => {
    setEditingItem(index);
  };

  const handleCloseClick = () => {
    setEditingItem(null);
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
      setEditingItem(0);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setItemToDelete(null);
  };

  return (
    <div>
      <NavBarC></NavBarC>
      <Alert
        key="warning"
        variant="warning"
        onClose={() => setShow(false)}
        dismissible
      >
        Notes are saved in the browser. They will be there next time you open it
        unless browser history is cleared.
      </Alert>
      <Container className="justify-content-center vh-100">
        <Row>
          <Col className="align-items-center justify-content-center" sm={4}>
            <div className="list-container">
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
                                {item.title}
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
          </Col>

          {editingItem !== null && items[editingItem] && (
            <Col sm={8}>
              <Container className="large-text-area-container">
                <div className="close-button" onClick={handleCloseClick}>
                  &times;
                </div>
                <textarea
                  className="col-12 form-control"
                  rows={15}
                  value={items[editingItem].description}
                  // onChange={(e) => setLargeText(e.target.value)}
                  onChange={(e) =>
                    handleDescriptionChange(editingItem, e.target.value)
                  }
                />
              </Container>
            </Col>
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
        </Row>
      </Container>
    </div>
  );
};

export default App;
