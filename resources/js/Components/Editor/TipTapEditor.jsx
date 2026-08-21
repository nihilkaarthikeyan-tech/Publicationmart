import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useRef, forwardRef } from 'react';

const TipTapEditor = forwardRef(({
    content,
    jsonContent,
    sectionKey,
    onUpdate,
    onEditorReady,
    editable = true,
    className = "",
    placeholder = "Start writing..."
}, ref) => {

    // Track whether the latest content change came from user typing
    const isUserEditRef = useRef(false);
    // Track which section is currently loaded to detect real section switches
    const loadedSectionRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable link and underline from StarterKit because we register
                // them separately below with custom configuration.
                // Without this, they get registered twice causing the 
                // "Duplicate extension names" warning and editor malfunction.
                link: false,
                underline: false,
            }),
            Underline,
            TextStyle,
            Color,
            FontFamily,
            Highlight.configure({ multicolor: true }),
            Link.configure({
                openOnClick: false,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
        ],
        content: jsonContent && Object.keys(jsonContent).length > 0 ? jsonContent : content,
        editable: editable,
        onUpdate: ({ editor }) => {
            // Flag that this change came from user editing
            isUserEditRef.current = true;
            // Send HTML and JSON back to parent
            onUpdate(editor.getHTML(), editor.getJSON());
        },
        onCreate: ({ editor }) => {
            loadedSectionRef.current = sectionKey;
            if (onEditorReady) {
                onEditorReady(editor);
            }
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose-base focus:outline-none min-h-[500px] ${className}`,
            },
        },
    });

    // Sync content ONLY when the section actually changes (not on every keystroke)
    useEffect(() => {
        if (!editor) return;

        // If the user just typed, the parent state updated and flowed back as new props.
        // We must NOT call setContent here or it creates an infinite loop.
        if (isUserEditRef.current) {
            isUserEditRef.current = false;
            return;
        }

        // Only force-load content when the section key changes (e.g., user clicked a different chapter)
        if (sectionKey === loadedSectionRef.current) {
            return;
        }

        loadedSectionRef.current = sectionKey;

        // Prioritize JSON Rehydration for fidelity
        if (jsonContent && typeof jsonContent === 'object' && Object.keys(jsonContent).length > 0) {
            editor.commands.setContent(jsonContent);
            return;
        }

        // Fallback to HTML
        if (content) {
            editor.commands.setContent(content);
        } else {
            editor.commands.setContent('');
        }
    }, [sectionKey, content, jsonContent, editor]);

    // Reactively update the editable state when the prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    return (
        <div
            ref={ref}
            className="tiptap-editor-wrapper w-full h-full cursor-text"
            onClick={(e) => {
                // Focus editor if user clicks in the empty space
                if (editor && !editor.isFocused) {
                    editor.commands.focus();
                }
            }}
        >
            <EditorContent editor={editor} />
        </div>
    );
});

export default TipTapEditor;

