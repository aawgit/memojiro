import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Tabs,
  Tab,
  Alert,
  Spinner,
  Modal,
  Button,
} from "react-bootstrap";
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
import "./styles/MobileLayout.css";
import SearchNotes from "./components/SearchNotes";
import AISuggestions from "./components/AISuggestions";

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
    itemToDelete,
    setCurrentTab,
    handleAddClick,
    handleDescriptionChange,
    handleItemClick,
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
    moveItemWrapper,
    noNotes,
    review,
    aiEnabled,
    updateAiEnabledStatus,
  } = useAppLogic(user, isMobile);

  const [searchResults, setSearchResults] = useState<{ [key: string]: Item[] }>(
    {}
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAISuggestionsModal, setShowAISuggestionsModal] = useState(false);

  useEffect(() => {
    logEvent(analytics, "page_view", { page_title: "Home" });
  }, []);

  const handleAISuggestionsClick = () => {
    setShowAISuggestionsModal(true);
  };

  const handleAISuggestionsClose = () => {
    setShowAISuggestionsModal(false);
  };

  return (
    <div>
      <Container fluid className="main-container">
        <Row>
          <NavBarC
            onAISuggestionsClick={
              isMobile && user ? handleAISuggestionsClick : undefined
            }
          />
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
        {noNotes && (
          <>
            <br />
            <NoItemsPanel handleInputKeyDown={handleInputKeyDown} />
          </>
        )}

        {!noNotes && (
          <Tabs
            id="controlled-tab-example"
            activeKey={currentTab}
            onSelect={(k) => setCurrentTab(k || Object.keys(tabData)[0])}
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
                <Row className="app-content">
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
                        handleDescriptionChange={handleDescriptionChange}
                        saveOnCloud={saveOnCloud}
                        loggedIn={!!user}
                        tabNames={Object.keys(tabData).reduce((acc, tabId) => {
                          if (tabId !== currentTab) {
                            acc[tabId] = tabData[tabId].name;
                          }
                          return acc;
                        }, {} as { [key: string]: string })}
                        moveItem={moveItemWrapper}
                      />
                    </Col>
                  ) : (
                    <>
                      <Col md={3} className="app-panel">
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
                          tabNames={Object.keys(tabData).reduce(
                            (acc, tabId) => {
                              if (tabId !== currentTab) {
                                acc[tabId] = tabData[tabId].name;
                              }
                              return acc;
                            },
                            {} as { [key: string]: string }
                          )}
                          moveItem={moveItemWrapper}
                        />
                      </Col>
                      <Col md={5} className="app-panel">
                        {editingItem !== null &&
                          tabData[tabKey].items[editingItem] && (
                            <ItemDetail
                              item={tabData[tabKey].items[editingItem]}
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
                        {editingItem == null && (
                          <p>
                            <i>Select a note title to view the content.</i>
                          </p>
                        )}
                      </Col>

                      <Col md={3} className="app-panel">
                        <SearchNotes
                          tabData={tabData}
                          searchResults={searchResults}
                          setSearchResults={setSearchResults}
                        />
                        {user && (
                          <AISuggestions
                            review={review}
                            aiEnabled={aiEnabled}
                            updateAiEnabledStatus={updateAiEnabledStatus}
                            showConfirmDialog={showConfirmation}
                            setShowConfirmDialog={setShowConfirmation}
                          />
                        )}
                      </Col>
                    </>
                  )}
                  {showConfirmDialog && itemToDelete != null && (
                    <ConfirmDialog
                      handleConfirmDelete={handleConfirmDelete}
                      handleCancelDelete={handleCancelDelete}
                      title={tabData[currentTab].items[itemToDelete].title}
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

        {/* AI Suggestions Modal for Mobile */}
        <Modal
          show={showAISuggestionsModal}
          onHide={handleAISuggestionsClose}
          centered
        >
          <Modal.Header closeButton>
            
          </Modal.Header>
          <Modal.Body>
            {user && (
              <AISuggestions
                review={review}
                aiEnabled={aiEnabled}
                updateAiEnabledStatus={updateAiEnabledStatus}
                showConfirmDialog={showConfirmation}
                setShowConfirmDialog={setShowConfirmation}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleAISuggestionsClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default App;
