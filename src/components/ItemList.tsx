import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import "../styles/ItemList.css"; // Create this file for ItemList specific styles
import ItemDetail from "./ItemDetail";

interface Item {
  title: string;
  description: string;
}

interface ItemListProps {
  items: Item[];
  inputVisible: boolean;
  handleAddClick: () => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleItemClick: (index: number) => void;
  handleDeleteClick: (index: number) => void;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>; // Add this line
  editingItem?: number | null;
  handleCloseClick?: () => void;
  handleDescriptionChange?: (index: number, newDescription: string) => void;
  saveOnCloud: (newDescription: string) => void; // New prop for saving to cloud
  loggedIn: boolean;
}

const reorder = (
  list: Item[],
  startIndex: number,
  endIndex: number
): Item[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const ItemList: React.FC<ItemListProps> = ({
  items,
  inputVisible,
  handleAddClick,
  handleInputKeyDown,
  handleItemClick,
  handleDeleteClick,
  setItems, // Add this line
  editingItem,
  handleCloseClick,
  handleDescriptionChange,
  saveOnCloud,
  loggedIn,
}) => {
  const onDragEnd = (result: DropResult): void => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    setItems(reorderedItems); // Use setItems here
  };

  return (
    <div className="list-container">
      <div style={{ alignContent: "center", display: "flex", width: "100%" }}>
        <div className="plus-circle" onClick={handleAddClick}>
          +
        </div>
      </div>
      {inputVisible && (
        <input
          type="text"
          className="input-field"
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items?.map((item, index) => (
                <div key={index}>
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
                        onClick={() => handleItemClick(index)}
                      >
                        <span>{item.title}</span>
                        <span
                          className="delete-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(index);
                          }}
                        >
                          🗑️
                        </span>
                      </div>
                    )}
                  </Draggable>
                  <div>
                    {editingItem === index &&
                      handleCloseClick &&
                      handleDescriptionChange && (
                        <div>
                          <ItemDetail
                            item={item}
                            handleCloseClick={handleCloseClick}
                            handleDescriptionChange={(newDescription) =>
                              handleDescriptionChange(
                                editingItem,
                                newDescription
                              )
                            }
                            saveOnCloud={saveOnCloud}
                            loggedIn={loggedIn}
                            isMobile={true}
                          />
                        </div>
                      )}
                  </div>
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ItemList;
