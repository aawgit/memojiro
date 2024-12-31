import React, { useState, useRef, useEffect } from "react";

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomEditor: React.FC<CustomEditorProps> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleDoubleClick = () => setIsEditing(true);

  const handleBlur = () => setIsEditing(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textArea = textAreaRef.current;
      if (textArea) {
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;

        // Insert 4 spaces at the cursor position
        const text = textArea.value;
        textArea.value = text.substring(0, start) + "    " + text.substring(end);
        textArea.selectionStart = textArea.selectionEnd = start + 4;

        onChange(textArea.value);
        adjustHeight(); // Adjust height dynamically
      }
    }
  };

  const onChangeInner = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const updatedValue = inputValue.replace(
      urlRegex,
      '<a href="$&" target="_blank"">$&</a>'
    );
    onChange(updatedValue);
  }

  const adjustHeight = () => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = "auto"; // Reset height to auto to recalculate
      textArea.style.height = `${textArea.scrollHeight}px`; // Set height to scrollHeight
    }
  };

  useEffect(() => {
    adjustHeight(); // Adjust height on component mount
  }, [value]); // Recalculate when value changes


  return (
    <div>
      {!isEditing ? (
        // Render HTML if the value contains valid HTML, else render as plain text
        <div
          style={{
            marginTop: "5px",
            border: "2px dashed #C0C0C0",
            borderRadius: "5px",
            padding: "10px",
            minHeight: "50px",
            whiteSpace: "pre-wrap", // Retain line breaks for plain text
          }}
          onDoubleClick={handleDoubleClick}
          dangerouslySetInnerHTML={{ __html: value? value: "Double click to edit" }}
        />
      ) : (
        // Render as a plain textarea for editing mode
        <textarea
          ref={textAreaRef}
          value={value}
          onChange={(e) => onChangeInner(e)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="custom-editor-textarea"
        />
      )}
    </div>
  );
};

export default CustomEditor;
