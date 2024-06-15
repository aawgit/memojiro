import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { Button, Modal, Form } from "react-bootstrap";
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

interface TabData {
  [key: string]: { name: string; items: Item[]; tabNameEditable: boolean };
}

const App: React.FC = () => {
  // Determine if the screen size is mobile
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Log page view event
  useEffect(() => {
    logEvent(analytics, "page_view", { page_title: "Home" });
  }, []);

  const [inputVisible, setInputVisible] = useState(false);
  const [show, setShow] = useState(true);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [items, setItems] = useState<Item[]>(() => {
    // Load state from localStorage if available
    const savedItems = getLocal("items");
    return savedItems ? savedItems : [];
  });

  // TODO: If not tab data, load the items in the storage to default tab
  const [tabData, setTabData] = useState<TabData>(() => {
    const savedData = getLocal("tabData");
    return savedData
      ? JSON.parse(savedData)
      : { 0: { name: "Home", items: items } };
  });
  const [currentTab, setCurrentTab] = useState(0);

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

  const handleAddTab = () => {
    const newTabId = Object.keys(tabData).length;
    // name: `Tab ${tabs.length + 1}`,
    // content: `This is Tab ${tabs.length + 1}`
    setTabData({
      ...tabData,
      [newTabId]: { name: "New tab", items: [], tabNameEditable: true },
    });
    return String(newTabId);
  };

  const handleDoubleClick = (key: string) => {
    let id = "";
    if (key === "<placeholder>") {
      id = handleAddTab();
    } else id = key;
    setTabData({
      ...tabData,
      [id]: { ...tabData[id], tabNameEditable: true },
    });
    console.log(`created new tab ${JSON.stringify(tabData)}`);
  };

  const handleBlur = (key: string, name: string) => {
    setTabData({
      ...tabData,
      [key]: { ...tabData[key], name, tabNameEditable: false },
    });
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: string,
    name: string
  ) => {
    if (e.key === "Enter") {
      handleBlur(key, name);
    }
  };

  const handleTitleChange = (key: string, newName: string) => {
    setTabData({
      ...tabData,
      [key]: { ...tabData[key], name: newName },
    });
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

        <Tabs
          id="controlled-tab-example"
          activeKey={currentTab}
          onSelect={(k) => setCurrentTab(Number(k) || 0)}
        >
          {Object.keys(tabData).map((tabKey) => (
            <Tab
              eventKey={tabKey}
              title={
                tabData[tabKey].tabNameEditable ? (
                  <input
                    type="text"
                    value={tabData[tabKey].name}
                    autoFocus
                    onChange={(e) => handleTitleChange(tabKey, e.target.value)}
                    onBlur={(e) => handleBlur(tabKey, e.target.value)}
                    onKeyPress={(e) =>
                      handleKeyPress(e, tabKey, e.target.value)
                    }
                  />
                ) : (
                  <span onDoubleClick={() => handleDoubleClick(tabKey)}>
                    {tabData[tabKey].name}
                  </span>
                )
              }
            >
              <Row className="macos-content">
                {isMobile ? (
                  <Col>
                    <ItemList
                      items={tabData[tabKey].items}
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
                        items={tabData[tabKey].items}
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
          ))}
          <Tab
            eventKey="<placeholder>"
            title={
              <span onDoubleClick={() => handleDoubleClick("<placeholder>")}>
                +
              </span>
            }
          ></Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default App;
