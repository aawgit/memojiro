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

export const useFirestore = (userId: string | null) => {
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
    }
  }, [userId]);

  const addItem = async (tabId: string, title: string) => {
    let id = null;
    if (userId && tabData[tabId]) {
      const itemDocRef = await addDoc(collection(db, "notes"), {
        userId,
        tabId: tabId,
        tabName: tabData[tabId].name,
        noteTitle: title,
      });
      id = itemDocRef.id;
    }
    const newItems = [
      ...tabData[tabId].items,
      { title: title, description: "", itemId: id },
    ];

    setTabData({
      ...tabData,
      [tabId]: { ...tabData[tabId], items: newItems },
    });
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
    if (userId && tabData[tabId]) {
      console.log(itemUUID);
      try {
        const itemDoc = doc(db, "notes", itemUUID);
        await deleteDoc(itemDoc);
        const newItems = tabData[tabId].items.filter((_, i) => i !== itemId);
        setTabData({
          ...tabData,
          [tabId]: { ...tabData[tabId], items: newItems },
        });
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  return { tabData, addItem, setTabData, deleteItem, updateItem };
};
