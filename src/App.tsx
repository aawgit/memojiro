import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { Alert } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebaseConfig";
import { setLocal } from "./hooks/usePersistentState";
import NavBarC from "./components/NavBar";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAuth } from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";
import "./styles/App.css";
import "./styles/DesktopLayout.css";
import "./styles/MobileLayout.css";

interface Item {
  title: string;
  description: string;
  itemId: string;
}

const App: React.FC = () => {
  // Determine if the screen size is mobile
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Log page view event
  useEffect(() => {
    logEvent(analytics, "page_view", { page_title: "Home" });
  }, []);
  const { user } = useAuth();
  const {
    tabData,
    setTabData,
    addItem,
    deleteItem,
    updateItem,
    updateNotesOrder,
  } = useFirestore(user?.uid || null);

  const [inputVisible, setInputVisible] = useState(false);
  // const [_, setShow] = useState(true);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [currentTab, setCurrentTab] = useState<string>("0");

  // Save tabData to local storage whenever it changes
  useEffect(() => {
    if (!user) setLocal("tabData", tabData);
  }, [tabData]);

  const handleAddClick = () => {
    setInputVisible(true);
  };

  const handleDescriptionChange = (index: number, newDescription: string) => {
    const updatedItems = tabData[currentTab].items.map((item, i) =>
      i === index ? { ...item, description: newDescription } : item
    );
    setTabData({
      ...tabData,
      [currentTab]: { ...tabData[currentTab], items: updatedItems },
    });
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
      const itemId = tabData[currentTab].items[itemToDelete].itemId;
      if (itemId) {
        deleteItem(currentTab, itemToDelete, itemId);
        setShowConfirmDialog(false);
        setItemToDelete(null);
        setEditingItem(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setItemToDelete(null);
  };

  const handleAddTab = () => {
    const newTabId = Object.keys(tabData).length.toString();
    setTabData({
      ...tabData,
      [newTabId]: { name: "New tab", items: [], tabNameEditable: true },
    });
    setCurrentTab(newTabId);
  };

  const handleDoubleClick = (key: string) => {
    if (key === "<placeholder>") {
      handleAddTab();
    } else {
      setTabData({
        ...tabData,
        [key]: { ...tabData[key], tabNameEditable: true },
      });
    }
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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      (e.target as HTMLInputElement).value.trim() !== ""
    ) {
      addItem(currentTab, (e.target as HTMLInputElement).value);
      setInputVisible(false);
      (e.target as HTMLInputElement).value = "";
      setEditingItem(null);
    }
  };

  const handleTitleChange = (key: string, newName: string) => {
    setTabData({
      ...tabData,
      [key]: { ...tabData[key], name: newName },
    });
  };

  const setItems = (items: Item[]) => {
    setTabData({
      ...tabData,
      [currentTab]: { ...tabData[currentTab], items },
    });
    if (user) updateNotesOrder(user.uid, currentTab, items);
  };

  const saveOnCloud = async (description: string) => {
    if (editingItem != null) {
      const itemId = tabData[currentTab].items[editingItem].itemId;
      if (itemId) await updateItem(currentTab, itemId, description);
    }
  };

  return (
    <div>
      <Container fluid>
        <Row>
          <NavBarC />
          {!user && (
            <Alert
              key="warning"
              variant="warning"
              // onClose={() => setShow(false)}
              dismissible
            >
              Notes are saved in the browser and will be available the next time
              you open this page unless the browsing history is cleared. We
              recommend logging in to save your notes to the cloud for access
              from all your devices. It's free.
            </Alert>
          )}
        </Row>

        <Tabs
          id="controlled-tab-example"
          activeKey={currentTab}
          onSelect={(k) => setCurrentTab(k || "0")}
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
                    onKeyDown={(e) =>
                      //@ts-ignore
                      handleKeyPress(e, tabKey, e.target.value)
                    }
                  />
                ) : (
                  <span onDoubleClick={() => handleDoubleClick(tabKey)}>
                    {tabData[tabKey].name}
                  </span>
                )
              }
              key={tabKey}
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
                      //@ts-ignore
                      setItems={setItems}
                      editingItem={editingItem}
                      handleCloseClick={handleCloseClick}
                      handleDescriptionChange={handleDescriptionChange}
                      saveOnCloud={saveOnCloud}
                      loggedIn={user ? true : false}
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
                        //@ts-ignore
                        setItems={setItems}
                      />
                    </Col>
                    <Col md={6} className="macos-panel">
                      {editingItem !== null &&
                        tabData[tabKey].items[editingItem] && (
                          <ItemDetail
                            item={tabData[tabKey].items[editingItem]}
                            handleCloseClick={handleCloseClick}
                            handleDescriptionChange={(newDescription) =>
                              handleDescriptionChange(
                                editingItem,
                                newDescription
                              )
                            }
                            saveOnCloud={saveOnCloud}
                            loggedIn={user ? true : false}
                            isMobile={false}
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
          {user && (
            <Tab
              eventKey="<placeholder>"
              title={
                <span onDoubleClick={() => handleDoubleClick("<placeholder>")}>
                  +
                </span>
              }
            />
          )}
        </Tabs>
      </Container>
    </div>
  );
};

export default App;
