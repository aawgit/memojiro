import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomEditor: React.FC<CustomEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            style: "margin: 0;", // Reduces space between lines
          },
        },
      }),
      Link.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
      }),
    ],
    content: value || "<p>Start typing here...</p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html); // Update the parent with editor content
    },
    editorProps: {
      attributes: {
        class:
          "ProseMirror focus:outline-none  border-gray-300 rounded-md p-3 bg-black text-white leading-tight whitespace-pre-wrap",
      },
      handleKeyDown(view, event) {
        if (event.key === "Tab") {
          event.preventDefault();
          const spaces = "\u00A0\u00A0\u00A0\u00A0"; // 4 non-breaking spaces
          view.dispatch(view.state.tr.insertText(spaces, view.state.selection.from));
          return true;
        }
        return false;
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value); // Sync editor with parent value
    }
  }, [value, editor]);

  return editor ? <EditorContent editor={editor} /> : null;
};

export default CustomEditor;
