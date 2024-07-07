import React from "react";

interface TabTitleProps {
  tabData: any;
  tabKey: string;
  handleDoubleClick: (key: string) => void;
  handleTitleChange: (key: string, newName: string) => void;
  handleBlur: (key: string, name: string) => void;
  handleKeyPress: (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: string,
    name: string
  ) => void;
}

const TabTitle: React.FC<TabTitleProps> = ({
  tabData,
  tabKey,
  handleDoubleClick,
  handleTitleChange,
  handleBlur,
  handleKeyPress,
}) => {
  return tabData[tabKey].tabNameEditable ? (
    <input
      type="text"
      value={tabData[tabKey].name}
      autoFocus
      onChange={(e) => handleTitleChange(tabKey, e.target.value)}
      onBlur={(e) => handleBlur(tabKey, e.target.value)}
      //@ts-ignore
      onKeyDown={(e) => handleKeyPress(e, tabKey, e.target.value)}
    />
  ) : (
    <span onDoubleClick={() => handleDoubleClick(tabKey)}>
      {tabData[tabKey].name}
    </span>
  );
};

export default TabTitle;
