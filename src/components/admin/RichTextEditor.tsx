"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { cn } from "@/lib/utils";

const TEXT_COLORS = ["#14181f", "#d0021b", "#0f766e", "#1e3a8a", "#854d0e", "#6b7280"];

export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "Yazmaya başlayın...",
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    // SSR'da hidrasyon uyuşmazlığını önler.
    immediatelyRender: false,
    extensions: [
      // StarterKit v3 link ve underline'ı zaten içeriyor; ayrıca eklenmiyor.
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      Image.configure({ HTMLAttributes: { class: "rounded" } }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[320px] w-full px-4 py-3 text-sm leading-7 text-ink outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  const text = editor?.getText() ?? "";
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <input type="hidden" name={name} value={html} />

      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-border bg-surface px-1 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-0.5 sm:overflow-visible sm:px-2 [&::-webkit-scrollbar]:hidden">
        <Btn editor={editor} label="Başlık 2" active={editor?.isActive("heading", { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Başlık 3" active={editor?.isActive("heading", { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </Btn>

        <Sep />

        <Btn editor={editor} label="Sola hizala" active={editor?.isActive({ textAlign: "left" })}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Ortala" active={editor?.isActive({ textAlign: "center" })}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Sağa hizala" active={editor?.isActive({ textAlign: "right" })}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="İki yana yasla" active={editor?.isActive({ textAlign: "justify" })}
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="h-4 w-4" />
        </Btn>

        <Sep />

        <Btn editor={editor} label="Kalın" active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="İtalik" active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Altı çizili" active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Üstü çizili" active={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </Btn>

        <ColorMenu editor={editor} />

        <Btn editor={editor} label="Vurgula" active={editor?.isActive("highlight")}
          onClick={() => editor?.chain().focus().toggleHighlight().run()}>
          <Highlighter className="h-4 w-4" />
        </Btn>

        <Sep />

        <Btn editor={editor} label="Madde listesi" active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Numaralı liste" active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Alıntı" active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Btn>

        <Sep />

        <Btn editor={editor} label="Bağlantı" active={editor?.isActive("link")}
          onClick={() => {
            const previous = editor?.getAttributes("link").href ?? "";
            const url = window.prompt("Bağlantı adresi", previous);
            if (url === null) return;
            if (url === "") {
              editor?.chain().focus().unsetLink().run();
              return;
            }
            editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}>
          <Link2 className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Görsel ekle" onClick={() => setPickerOpen(true)}>
          <ImagePlus className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Tablo ekle"
          onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Kod bloğu" active={editor?.isActive("codeBlock")}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
          <Code className="h-4 w-4" />
        </Btn>
        <Btn editor={editor} label="Ayraç"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </Btn>

        <div className="ml-auto flex items-center gap-0.5">
          <Btn editor={editor} label="Geri al" onClick={() => editor?.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </Btn>
          <Btn editor={editor} label="İleri al" onClick={() => editor?.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </Btn>
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="flex items-center gap-4 border-t border-border bg-surface px-4 py-1.5 text-[11px] text-ink-soft">
        <span>Karakter: {charCount}</span>
        <span>Kelime: {wordCount}</span>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => editor?.chain().focus().setImage({ src: url }).run()}
      />
    </div>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}

function Btn({
  children,
  label,
  onClick,
  active,
  editor,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  editor: Editor | null;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={!editor}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded transition-colors disabled:opacity-40 sm:h-8 sm:w-8",
        active ? "bg-brand text-white" : "text-ink hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

function ColorMenu({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <Btn editor={editor} label="Yazı rengi" onClick={() => setOpen((v) => !v)}>
        <Palette className="h-4 w-4" />
      </Btn>
      {open ? (
        <span className="absolute top-9 left-0 z-10 flex gap-1 rounded-lg border border-border bg-white p-2 shadow-lg">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              aria-label={`Renk ${c}`}
              onClick={() => {
                editor?.chain().focus().setColor(c).run();
                setOpen(false);
              }}
              className="h-5 w-5 rounded-full border border-border"
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            title="Rengi kaldır"
            onClick={() => {
              editor?.chain().focus().unsetColor().run();
              setOpen(false);
            }}
            className="h-5 w-5 rounded-full border border-border bg-white text-[10px] leading-none text-ink-soft"
          >
            ×
          </button>
        </span>
      ) : null}
    </span>
  );
}
