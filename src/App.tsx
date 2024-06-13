import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Alert from "react-bootstrap/Alert";
import { useMediaQuery } from "react-responsive";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebaseConfig";
import { getLocal, setLocal } from "./hooks/usePersistentState";
import NavBarC from "./components/NavBar";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ConfirmDialog from "./components/ConfirmDialog";
import "./styles/App.css";
import "./styles/DesktopLayout.css";
import "./styles/MobileLayout.css";

interface Item {
  title: string;
  description: string;
}

const App: React.FC = () => {
  const [inputVisible, setInputVisible] = useState(false);
  const [show, setShow] = useState(true);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Determine if the screen size is mobile
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Log page view event
  useEffect(() => {
    logEvent(analytics, "page_view", { page_title: "Home" });
  }, []);

  const [items, setItems] = useState<Item[]>(() => {
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
      setEditingItem(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setItemToDelete(null);
  };

  return (
    <div>
      <Container fluid className="macos-container">
        <Row>
          <NavBarC />
          <Alert
            key="warning"
            variant="warning"
            onClose={() => setShow(false)}
            dismissible
          >
            Notes are saved in the browser and will be here next time you open
            this page, unless browsing history is cleared.
          </Alert>
        </Row>
        <Tabs>
          <Tab eventKey="home" title="Home">
            <Row className="macos-content">
              {isMobile ? (
                <Col>
                  <ItemList
                    items={items}
                    inputVisible={inputVisible}
                    handleAddClick={handleAddClick}
                    handleInputKeyDown={handleInputKeyDown}
                    handleItemClick={handleItemClick}
                    handleDeleteClick={handleDeleteClick}
                    setItems={setItems} // Add this line
                    editingItem={editingItem}
                    handleCloseClick={handleCloseClick}
                    handleDescriptionChange={handleDescriptionChange}
                  />
                </Col>
              ) : (
                <>
                  <Col md={3} className="macos-panel">
                    <ItemList
                      items={items}
                      inputVisible={inputVisible}
                      handleAddClick={handleAddClick}
                      handleInputKeyDown={handleInputKeyDown}
                      handleItemClick={handleItemClick}
                      handleDeleteClick={handleDeleteClick}
                      setItems={setItems} // Add this line
                    />
                  </Col>
                  <Col md={6} className="macos-panel">
                    {editingItem !== null && items[editingItem] && (
                      <ItemDetail
                        item={items[editingItem]}
                        handleCloseClick={handleCloseClick}
                        handleDescriptionChange={(newDescription) =>
                          handleDescriptionChange(editingItem, newDescription)
                        }
                      />
                    )}
                  </Col>
                </>
              )}
              {showConfirmDialog && (
                <ConfirmDialog
                  handleConfirmDelete={handleConfirmDelete}
                  handleCancelDelete={handleCancelDelete}
                />
              )}
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default App;
