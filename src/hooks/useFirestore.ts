import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getLocal } from "./usePersistentState";

interface Item {
  title: string;
  description: string;
  itemId: string | null;
}

interface TabData {
  [key: string]: { name: string; items: Item[]; tabNameEditable: boolean };
}

interface NotesOrder {
  [key: string]: string[];
}

export const useFirestore = (userId: string | null) => {
  const [notesOrder, setNotesOrder] = useState<NotesOrder>({});
  // Initialize tabData from local storage or default value
  const [tabData, setTabData] = useState<TabData>(() => {
    const savedData = getLocal("tabData");
    return savedData
      ? savedData
      : {
          "0": {
            name: "Home",
            items: getLocal("items") ? getLocal("items") : [],
            tabNameEditable: false,
          },
        };
  });

  useEffect(() => {
    if (userId) {
      const fetchTabsAndItems = async () => {
        const notesQuery = query(
          collection(db, "notes"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(notesQuery);
        const fetchedTabData: TabData = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const tabId = data.tabId;
          const tabName = data.tabName;
          const item: Item = {
            title: data.noteTitle,
            description: data.description,
            itemId: doc.id,
          };

          if (!fetchedTabData[tabId]) {
            fetchedTabData[tabId] = {
              name: tabName,
              items: [],
              tabNameEditable: false,
            };
          }
          fetchedTabData[tabId].items.push(item);
        });

        if (Object.keys(fetchedTabData).length > 0) {
          setTabData(fetchedTabData);
        } else {
          // Only used when a user logs in for the first time - for backwards compatibility
          if (tabData) {
            try {
              // Save local data to Firestore
              for (const tabId in tabData) {
                const savedItems = [];
                const tab = tabData[tabId];
                for (const item of tab.items) {
                  const itemDocRef = await addDoc(collection(db, "notes"), {
                    userId,
                    tabId: tabId,
                    tabName: tab.name,
                    noteTitle: item.title,
                    description: item.description ? item.description : "",
                  });
                  // To add itemID
                  savedItems.push({ ...item, itemId: itemDocRef.id });
                }
                setTabData({
                  ...tabData,
                  [tabId]: { ...tabData[tabId], items: savedItems },
                });
              }
            } catch (error) {
              console.error(
                "Error adding document: ",
                error.code,
                error.message
              );
            }
          }
        }
      };

      fetchTabsAndItems();
      fetchAllNotesOrder(userId);
    }
  }, [userId]);

  const addItem = async (tabId: string, title: string) => {
    // Create a temporary item without an itemId
    const tempItem = { title, description: "", itemId: null };
    const newItems = [tempItem, ...tabData[tabId].items];

    // Update the state with the temporary item
    setTabData({
      ...tabData,
      [tabId]: { ...tabData[tabId], items: newItems },
    });

    // Add the new item to Firestore and get the itemId
    if (userId && tabData[tabId]) {
      try {
        const itemDocRef = await addDoc(collection(db, "notes"), {
          userId,
          tabId: tabId,
          tabName: tabData[tabId].name,
          noteTitle: title,
        });
        const id = itemDocRef.id;

        // Update the state with the received itemId
        const updatedItems = newItems.map((item) =>
          item === tempItem ? { ...item, itemId: id } : item
        );

        setTabData({
          ...tabData,
          [tabId]: { ...tabData[tabId], items: updatedItems },
        });

        // Update the notes order in Firestore
        if (userId) updateNotesOrder(userId, tabId, updatedItems);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const updateItem = async (
    tabId: string,
    itemId: string,
    description: string
  ) => {
    if (userId && tabData[tabId]) {
      try {
        const itemDoc = doc(db, "notes", itemId);
        await updateDoc(itemDoc, { description });
        setTabData({
          ...tabData,
          [tabId]: {
            ...tabData[tabId],
            items: tabData[tabId].items.map((item) =>
              item.itemId === itemId ? { ...item, description } : item
            ),
          },
        });
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  const deleteItem = async (
    tabId: string,
    itemId: number,
    itemUUID: string
  ) => {
    const newItems = tabData[tabId].items.filter((_, i) => i !== itemId);
        setTabData({
          ...tabData,
          [tabId]: { ...tabData[tabId], items: newItems },
        });
    if (userId && tabData[tabId]) {
      try {
        const itemDoc = doc(db, "notes", itemUUID);
        await deleteDoc(itemDoc);
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const fetchAllNotesOrder = async (userId: string) => {
    try {
      const notesOrderQuery = query(
        collection(db, "note_order"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(notesOrderQuery);

      const fetchedNotesOrder: NotesOrder = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const tabId = data.tabId;
        fetchedNotesOrder[tabId] = data.order;
      });

      setNotesOrder(fetchedNotesOrder);
    } catch (error) {
      console.error("Error fetching notes order: ", error);
    }
  };

  useEffect(() => {
    const reorderItems = () => {
      const updatedTabData = { ...tabData };

      Object.keys(notesOrder).forEach((tabId) => {
        if (updatedTabData[tabId]) {
          const orderedItems = notesOrder[tabId]
            .map((itemId) =>
              updatedTabData[tabId].items.find((item) => item.itemId === itemId)
            )
            .filter((item) => item !== undefined) as Item[];

          // Handle items not in notesOrder
          const unorderedItems = updatedTabData[tabId].items.filter(
            (item) => !notesOrder[tabId].includes(item.itemId!)
          );

          updatedTabData[tabId].items = [...orderedItems, ...unorderedItems];
        }
      });

      setTabData(updatedTabData);
    };

    if (Object.keys(notesOrder).length > 0) {
      reorderItems();
    }
  }, [notesOrder]);

  const updateNotesOrder = async (
    userId: string,
    tabId: string,
    items: Item[]
  ) => {
    try {
      const order = items.map((item) => item.itemId);
      const orderDocRef = doc(db, "note_order", `${userId}_${tabId}`);

      await setDoc(
        orderDocRef,
        {
          userId,
          tabId,
          order,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating notes order: ", error);
    }
  };

  return {
    tabData,
    addItem,
    setTabData,
    deleteItem,
    updateItem,
    updateNotesOrder,
  };
};
