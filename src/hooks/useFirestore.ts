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

export interface Item {
  title: string;
  description: string;
  itemId: string | null;
}

export interface tabDetails {
  tabId: string;
  name: string;
}

export interface TabData {
  [key: string]: { name: string; items: Item[]; tabNameEditable: boolean };
}

interface NotesOrder {
  [key: string]: string[];
}

export const useFirestore = (userId: string | null) => {
  const [currentTab, setCurrentTab] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [notesOrder, setNotesOrder] = useState<NotesOrder>({});

  // TODO: Reconsider this block considering the current version.
  // Two cases
  // 1. Not logged in
  // 2. Logged in
  //    - First time
  //    - Not the first time

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

  const [noNotes, setNoNotes] = useState<boolean>(false);

  const pushTabDatatoDB = async (tabData: TabData, userId: string) => {
    try {
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
          savedItems.push({ ...item, itemId: itemDocRef.id });
        }
        setTabData({
          ...tabData,
          [tabId]: { ...tabData[tabId], items: savedItems },
        });
      }
    } catch (error: any) {
      // console.error(
      //   "Error adding document: ",
      //   error.code,
      //   error.message
      // );
    }
  };

  useEffect(() => {
    if (userId) {
      const fetchTabsAndItems = async () => {
        setLoading(true);
        try {
          const notesQuery = query(
            collection(db, "notes"),
            where("userId", "==", userId)
          );
          const notesQuerySnapshot = await getDocs(notesQuery);

          const tabsQuery = query(
            collection(db, "tabs"),
            where("userId", "==", userId)
          );
          const tabsQuerySnapshot = await getDocs(tabsQuery);
          let tabDetails: tabDetails[] = [];
          tabsQuerySnapshot.forEach((tq) => {
            const data = tq.data();
            tabDetails.push({ tabId: data.tabId, name: data.name });
          });

          const fetchedTabData: TabData = {};

          notesQuerySnapshot.forEach((doc) => {
            const data = doc.data();
            const tabId = data.tabId;
            //const tabName = data.tabName;
            let tabName: string | undefined;
            if (tabDetails)
              tabName = tabDetails.find((td) => td.tabId === tabId)?.name;
            else tabName = "no name";
            const item: Item = {
              title: data.noteTitle,
              description: data.description,
              itemId: doc.id,
            };

            if (!fetchedTabData[tabId]) {
              fetchedTabData[tabId] = {
                name: tabName ? tabName : "no name",
                items: [],
                tabNameEditable: false,
              };
            }
            fetchedTabData[tabId].items.push(item);
          });

          if (Object.keys(fetchedTabData).length > 0) {
            setTabData(fetchedTabData);
          } else {
            if (tabData) {
              pushTabDatatoDB(tabData, userId);
            }
          }
        } finally {
          setLoading(false);
        }
      };

      const fetchNotesAndOrder = async () => {
        await fetchTabsAndItems();
        await fetchAllNotesOrder(userId);
      };

      fetchNotesAndOrder();
    }
  }, [userId]);

  const addItem = async (tabId: string, title: string) => {
    const tempItem = {
      title,
      description: "",
      itemId: String(tabData[tabId].items.length),
    };
    const newItems = [tempItem, ...tabData[tabId].items];

    setTabData({
      ...tabData,
      [tabId]: { ...tabData[tabId], items: newItems },
    });

    if (userId && tabData[tabId]) {
      try {
        const itemDocRef = await addDoc(collection(db, "notes"), {
          userId,
          tabId: tabId,
          tabName: tabData[tabId].name,
          noteTitle: title,
        });
        const id = itemDocRef.id;

        const updatedItems = newItems.map((item) =>
          item === tempItem ? { ...item, itemId: id } : item
        );

        setTabData({
          ...tabData,
          [tabId]: { ...tabData[tabId], items: updatedItems },
        });

        if (userId) updateNotesOrder(userId, tabId, updatedItems);
      } catch (error) {
        // console.error("Error adding document: ", error);
      }
    }
  };

  const updateItemDesc = async (
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
        // console.error("Error updating document: ", error);
      }
    }
  };

  const deleteItem = async (
    tabId: string,
    itemId: number,
    itemUUID: string
  ) => {
    const newItems = tabData[tabId].items.filter((_, i) => i !== itemId);

    if (newItems.length === 0) {
      // Remove the tab if there are no items left
      const newTabData = { ...tabData };
      delete newTabData[tabId];
      if (Object.keys(newTabData).length === 0) {
        setTabData({
          "0": {
            name: "Home",
            items: [],
            tabNameEditable: false,
          },
        });
        setCurrentTab("0");
      } else setTabData(newTabData);
    } else {
      // Update the tab with the new list of items
      setTabData({
        ...tabData,
        [tabId]: { ...tabData[tabId], items: newItems },
      });
    }

    if (userId && tabData[tabId]) {
      try {
        const itemDoc = doc(db, "notes", itemUUID);
        await deleteDoc(itemDoc);
      } catch (error) {
        // console.error("Error deleting document: ", error);
      }
    }
  };

  const fetchAllNotesOrder = async (userId: string) => {
    setLoading(true);
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
      // console.error("Error fetching notes order: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const reorderItems = () => {
      const updatedTabData = { ...tabData };
      console.log(JSON.stringify(tabData));

      Object.keys(notesOrder).forEach((tabId) => {
        console.log(tabId);
        if (updatedTabData[tabId]) {
          const orderedItems = notesOrder[tabId]
            .map((itemId) =>
              updatedTabData[tabId].items.find((item) => item.itemId === itemId)
            )
            .filter((item) => item !== undefined) as Item[];

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
      // console.error("Error updating notes order: ", error);
    }
  };

  const moveItem = async (
    sourceTabId: string,
    sourceIndex: number,
    destinationTabId: string
  ) => {
    const item = tabData[sourceTabId].items[sourceIndex];
    if (!item) return;
    // Remove the item from the current tab
    const updatedSourceTabItems = tabData[sourceTabId].items.filter(
      (_, index) => index !== sourceIndex
    );

    // Add the item to the new tab
    const updatedDestinationTabItems = [
      ...tabData[destinationTabId].items,
      item,
    ];

    setTabData({
      ...tabData,
      [sourceTabId]: {
        ...tabData[sourceTabId],
        items: updatedSourceTabItems,
      },
      [destinationTabId]: {
        ...tabData[destinationTabId],
        items: updatedDestinationTabItems,
      },
    });

    if (userId && tabData[sourceTabId] && tabData[destinationTabId]) {
      try {
        // Update the item in Firestore
        const itemDoc = doc(db, "notes", item.itemId!);
        await updateDoc(itemDoc, {
          tabId: destinationTabId,
          tabName: tabData[destinationTabId].name,
        });

        // Optionally, update notes order for both tabs
        updateNotesOrder(userId, sourceTabId, updatedSourceTabItems);
        updateNotesOrder(userId, destinationTabId, updatedDestinationTabItems);
      } catch (error) {
        // console.error("Error moving item: ", error);
      }
    }
  };

  const checkIfEmpty = () => {
    if (Object.entries(tabData).length === 0) setNoNotes(true);
    else if (Object.entries(tabData)[0][1].items.length === 0) setNoNotes(true);
    else setNoNotes(false);
  };

  const upsertTab = async (tabId: string, tabName: string) => {
    setTabData({
      ...tabData,
      [tabId]: { ...tabData[tabId], name: tabName, tabNameEditable: false },
    });
    if (userId) {
      const tabDocRef = doc(db, "tabs", `${userId}_${tabId}`);
      setDoc(
        tabDocRef,
        { name: tabName, userId: userId, tabId: tabId },
        { merge: true }
      );
    }
  };

  return {
    tabData,
    addItem,
    setTabData,
    deleteItem,
    updateItem: updateItemDesc,
    updateNotesOrder,
    loading, // Return loading state
    moveItem,
    noNotes,
    checkIfEmpty,
    currentTab,
    setCurrentTab,
    upsertTab,
  };
};
