import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
      }),
    ],
    content: value || "<p>Start typing here...</p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html); // Update the parent component with the editor content
    },
    editorProps: {
      attributes: {
        class:
          "ProseMirror focus:outline-none border border-gray-300 rounded-md p-3 bg-black text-white",
      },
      handleKeyDown(view, event) {
        if (event.key === "Tab") {
          event.preventDefault();
          view.dispatch(
            view.state.tr.insertText("    ", view.state.selection.from)
          );
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return editor ? <EditorContent editor={editor} /> : null;
};

export default TiptapEditor;
