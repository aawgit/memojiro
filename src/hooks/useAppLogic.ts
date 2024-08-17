import { useState, useEffect } from "react";
import { setLocal } from "../hooks/usePersistentState";
import { useFirestore } from "../hooks/useFirestore";
import { generateTabId } from "../utils/utils";

interface Item {
  title: string;
  description: string;
  itemId: string;
}

const useAppLogic = (user: any, isMobile: boolean) => {
  const {
    tabData,
    setTabData,
    addItem,
    deleteItem,
    updateItem,
    updateNotesOrder,
    loading,
    moveItem,
    noNotes,
    checkIfEmpty,
    currentTab,
    setCurrentTab,
    upsertTab,
  } = useFirestore(user?.uid || null);

  const [inputVisible, setInputVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // This is causing too many renders, even if logged.
  // TODO: Optimize this.
  useEffect(() => {
    if (!user) setLocal("tabData", tabData);
  }, [tabData]);

  useEffect(checkIfEmpty, [tabData]);

  const handleAddClick = () => setInputVisible(true);
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
    setEditingItem((prevIndex) => (prevIndex === index ? null : index));
  };
  const handleCloseClick = () => setEditingItem(null);
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
    const newTabId = generateTabId();
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
    // Add new tab or update the tab name
    upsertTab(key, name);
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
      if (isMobile) setEditingItem(null);
      else setEditingItem(0);
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
  const saveOnCloud = async () => {
    if (editingItem != null) {
      const itemId = tabData[currentTab].items[editingItem].itemId;
      const description = tabData[currentTab].items[editingItem].description;
      if (itemId) await updateItem(currentTab, itemId, description);
    }
  };

  const moveItemWrapper = (sourceIndex: number, destinationTabId: string) => {
    moveItem(currentTab, sourceIndex, destinationTabId);
  };

  return {
    tabData,
    inputVisible,
    editingItem,
    showConfirmDialog,
    currentTab,
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
    loading,
    itemToDelete,
    moveItemWrapper,
    noNotes,
  };
};

export default useAppLogic;
