import React, { useState } from "react";
import { Item, TabData } from "../hooks/useFirestore"; // Adjust the path as necessary

interface SearchNotesProps {
  tabData: TabData;
}

const SearchNotes: React.FC<SearchNotesProps> = ({ tabData }) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<{ [key: string]: Item[] }>(
    {}
  );

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      const searchWords = searchText.toLowerCase().split(" ");
      const results: { [key: string]: Item[] } = {};

      Object.keys(tabData).forEach((tabId) => {
        const tab = tabData[tabId];
        const filteredItems = tab.items.filter((item) =>
          searchWords.some(
            (word) =>
              item.title.toLowerCase().includes(word) ||
              (item.description &&
                item.description.toLowerCase().includes(word))
          )
        );
        if (filteredItems.length > 0) {
          results[tab.name] = filteredItems;
        }
      });
      setSearchResults(results);
      setSearchText("");
    }
  };
  return (
    <div className="search-notes">
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleSearch}
        className="input-field"
      />
      <div className="search-results">
        {Object.keys(searchResults).map((tabName, index) => (
          <div key={index}>
            <br></br>
            <h5>{tabName}</h5>
            <ul>
              {searchResults[tabName].map((item, itemIndex) => (
                <li key={itemIndex}>{item.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchNotes;
