import React, { useEffect } from "react";
import { Container, Row, Col, Tabs, Tab, Alert } from "react-bootstrap";
import { Spinner } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebaseConfig";
import NavBarC from "./components/NavBar";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAuth } from "./hooks/useAuth";
import useAppLogic from "./hooks/useAppLogic";
import TabTitle from "./components/TabTitle";
import { Item } from "./hooks/useFirestore";
import NoItemsPanel from "./components/NoItemsPanel";
import "./styles/App.css";
import "./styles/DesktopLayout.css";
import "./styles/MobileLayout.css";

const App: React.FC = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { user } = useAuth();
  const {
    tabData,
    inputVisible,
    editingItem,
    showConfirmDialog,
    currentTab,
    loading,
    setCurrentTab,
    handleAddClick,
    handleDescriptionChange,
    handleItemClick,
    handleCloseClick,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleDoubleClick,
    handleInputKeyDown,
    handleTitleChange,
    setItems,
    saveOnCloud,
    handleBlur,
    handleKeyPress,
  } = useAppLogic(user);

  useEffect(() => {
    logEvent(analytics, "page_view", { page_title: "Home" });
  }, []);

  return (
    <div>
      <Container fluid>
        <Row>
          <NavBarC />
          {!user && (
            <Alert key="warning" variant="warning" dismissible>
              Notes are saved in the browser and will be available the next time
              you open this page unless the browsing history is cleared. We
              recommend logging in to save your notes to the cloud for access
              from all your devices. It's free.
            </Alert>
          )}
        </Row>
        {loading && (
          <div className="loading-overlay">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
        {tabData["0"].items.length == 0 && (
          <NoItemsPanel handleInputKeyDown={handleInputKeyDown}></NoItemsPanel>
        )}
        {tabData["0"].items.length > 0 && (
          <Tabs
            id="controlled-tab-example"
            activeKey={currentTab}
            onSelect={(k) => setCurrentTab(k || "0")}
          >
            {Object.keys(tabData).map((tabKey) => (
              <Tab
                eventKey={tabKey}
                title={
                  <TabTitle
                    tabData={tabData}
                    tabKey={tabKey}
                    handleDoubleClick={handleDoubleClick}
                    handleTitleChange={handleTitleChange}
                    handleBlur={handleBlur}
                    handleKeyPress={handleKeyPress}
                  />
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
                        setItems={
                          setItems as React.Dispatch<
                            React.SetStateAction<Item[]>
                          >
                        }
                        editingItem={editingItem}
                        handleCloseClick={handleCloseClick}
                        handleDescriptionChange={handleDescriptionChange}
                        saveOnCloud={saveOnCloud}
                        loggedIn={!!user}
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
                          setItems={
                            setItems as React.Dispatch<
                              React.SetStateAction<Item[]>
                            >
                          }
                          saveOnCloud={saveOnCloud}
                          loggedIn={!!user}
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
                              loggedIn={!!user}
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
                  <span
                    onDoubleClick={() => handleDoubleClick("<placeholder>")}
                  >
                    +
                  </span>
                }
              />
            )}
          </Tabs>
        )}
      </Container>
    </div>
  );
};

export default App;
