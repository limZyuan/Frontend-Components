import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect
} from "react";
import ReactDOM from "react-dom";
import isHotkey from "is-hotkey";
import { Slate, Editable, withReact, useSlate, ReactEditor } from "slate-react";
import {
  Editor,
  Range,
  Point,
  createEditor,
  Transforms,
  Text,
  Node
} from "slate";
import { withHistory } from "slate-history";

import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

// Hovering toolbar menu
const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    style={{
      display: "inline-block",
      marginLeft: "15px",
      padding: "8px 7px 6px",
      position: "absolute",
      zIndex: 1,
      top: "-10000px",
      left: "-10000px",
      marginTop: "-6px",
      opacity: 0,
      backdropFilter: "invert(0.25)",
      borderRadius: "4px",
      transition: "opacity 0.75s"
    }}
  />
));

// portal for hovering toolbar
const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

// keys for formatting
const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

// list types
const LIST_TYPES = ["numbered-list", "bulleted-list"];

const SlateEditor = () => {
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(
    () => withTables(withHistory(withReact(createEditor()))),
    []
  );

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <Toolbar
        variant="dense"
        style={{
          marginTop: "30px",
          background: "white",
          marginRight: "30px",
          border: "0.1px grey solid",
          borderBottom: "1px #ddd solid",
          borderTopRightRadius: "5px",
          borderTopLeftRadius: "5px",
          padding: "10px"
        }}
      >
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <BlockButton format="" icon="table_chart" />
      </Toolbar>
      <HoveringToolbar />
      <Editable
        style={{
          background: "white",
          marginRight: "30px",
          border: "0.1px grey solid",
          borderBottomRightRadius: "5px",
          borderBottomLeftRadius: "5px",
          height: "80vh",
          padding: "10px"
        }}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
        // for hovering toolbar
        onDOMBeforeInput={event => {
          switch (event.inputType) {
            case "formatBold":
              return toggleFormat(editor, "bold");
            case "formatItalic":
              return toggleFormat(editor, "italic");
            case "formatUnderline":
              return toggleFormat(editor, "underline");
            default:
              return;
          }
        }}
      />
    </Slate>
  );
};

// for hovering toolbar
const toggleFormat = (editor, format) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true }
  );
};

// for hovering toolbar
const isFormatActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n[format] === true,
    mode: "all"
  });
  return !!match;
};

// for toolbar custom styles
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// table element
const withTables = editor => {
  const { deleteBackward, deleteForward, insertBreak } = editor;

  editor.deleteBackward = unit => {
    const { selection } = editor;
    const [table] = Editor.nodes(editor, { match: n => n.type === "table" });

    if (table) {
      if (selection && Range.isCollapsed(selection)) {
        const [cell] = Editor.nodes(editor, {
          match: n => n.type === "table-cell"
        });
        if (cell) {
          const [, cellPath] = cell;
          const start = Editor.start(editor, cellPath);
          if (Point.equals(selection.anchor, start)) {
            return;
          }
          const [row] = Editor.nodes(editor, {
            match: n => n.type === "table-row"
          });

          for (const [node, path] of Editor.nodes(editor, {
            at: row[1],
            match: n => n.type === "table-cell"
          })) {
            var array = path.slice();
            array.push(0);
            if (
              JSON.stringify(array) === JSON.stringify(selection.anchor.path)
            ) {
              Transforms.delete(editor, {
                at: {
                  path: array,
                  offset: selection.anchor.offset - 1
                },
                unit: "character"
              });
            } else {
              continue;
            }
          }
        }
      }
      return;
    }

    deleteBackward(unit);
  };

  editor.deleteForward = unit => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => n.type === "table-cell"
      });

      if (cell) {
        const [, cellPath] = cell;
        const end = Editor.end(editor, cellPath);

        if (Point.equals(selection.anchor, end)) {
          return;
        }
      }
    }

    deleteForward(unit);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [table] = Editor.nodes(editor, { match: n => n.type === "table" });
      if (table) {
        if (selection && Range.isCollapsed(selection)) {
          const [cell] = Editor.nodes(editor, {
            match: n => n.type === "table-cell"
          });

          if (cell) {
            const [row] = Editor.nodes(editor, {
              match: n => n.type === "table-row"
            });

            for (const [node, path] of Editor.nodes(editor, {
              at: row[1],
              match: n => n.type === "table-cell"
            })) {
              var array = path.slice();
              array.push(0);
              if (
                JSON.stringify(array) === JSON.stringify(selection.focus.path)
              ) {
                Transforms.insertText(editor, "\n");
              } else {
                continue;
              }
            }
          }
        }

        return editor;
      }
    }

    insertBreak();
  };

  return editor;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "table":
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return (
        <td
          {...attributes}
          valign="top"
          style={{
            border: "2px #ddd solid"
          }}
        >
          {children}
        </td>
      );
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

const HoveringToolbar = () => {
  const ref = useRef();
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.style.opacity = 0;
      el.style.pointerEvents = "none";
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.pointerEvents = "auto";
    el.style.opacity = 1;
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`;
  });

  return (
    <Portal>
      <Menu ref={ref}>
        <FormatButton format="bold" icon="format_bold" />
        <FormatButton format="italic" icon="format_italic" />
        <FormatButton format="underline" icon="format_underlined" />
      </Menu>
    </Portal>
  );
};

// toolbar button
const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <IconButton
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon style={{ fontSize: 20, color: "#ddd" }}>{icon}</Icon>
    </IconButton>
  );
};
// toolbar button
const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <IconButton
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon style={{ fontSize: 20, color: "#ddd" }}>{icon}</Icon>
    </IconButton>
  );
};
// hovering toolbar button
const FormatButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <IconButton
      style={{ marginLeft: "3px", marginRight: "3px" }}
      size="small"
      reversed
      active={isFormatActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleFormat(editor, format);
      }}
    >
      <Icon style={{ fontSize: 15, color: "#ddd" }}>{icon}</Icon>
    </IconButton>
  );
};

// value to be rendered initially
const initialValue = [
  {
    children: [
      {
        text:
          "Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:"
      }
    ]
  },
  {
    type: "table",
    children: [
      {
        type: "table-row",
        children: [
          {
            type: "table-cell",
            children: [{ text: "" }]
          },
          {
            type: "table-cell",
            children: [{ text: "Human", bold: true }]
          },
          {
            type: "table-cell",
            children: [{ text: "Dog", bold: true }]
          },
          {
            type: "table-cell",
            children: [{ text: "Cat", bold: true }]
          }
        ]
      },
      {
        type: "table-row",
        children: [
          {
            type: "table-cell",
            children: [{ text: "# of Feet", bold: true }]
          },
          {
            type: "table-cell",
            children: [{ text: "2" }]
          },
          {
            type: "table-cell",
            children: [{ text: "4" }]
          },
          {
            type: "table-cell",
            children: [{ text: "4" }]
          }
        ]
      },
      {
        type: "table-row",
        children: [
          {
            type: "table-cell",
            children: [{ text: "# of Lives", bold: true }]
          },
          {
            type: "table-cell",
            children: [{ text: "1" }]
          },
          {
            type: "table-cell",
            children: [{ text: "1" }]
          },
          {
            type: "table-cell",
            children: [{ text: "9" }]
          }
        ]
      }
    ]
  },
  {
    children: [
      {
        text:
          "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!"
      }
    ]
  }
];

export default SlateEditor;
