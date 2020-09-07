import { isKeyHotkey } from "is-hotkey";
import MarkStrategy from "../strategies/MarkStrategy";
import ColorStrategy from "../strategies/ColorStrategy";
import Colors from "../Colors";
import SlateEditTable from "@gitbook/slate-edit-table";
import EditListPlugin from "../plugins/EditListPlugin";

const { isSelectionInTable } = SlateEditTable().utils;
const { isSelectionInList } = EditListPlugin.utils;

const markHotkeys = Object.entries({
  bold: isKeyHotkey("mod+b"),
  italic: isKeyHotkey("mod+i"),
  underline: isKeyHotkey("mod+u")
});

const colorHotkeys = Object.entries(Colors)
  .filter(([color, colorProps]) => colorProps.hotkey)
  .map(([color, colorProps]) => [color, isKeyHotkey(colorProps.hotkey)]);

const lastColorHotkey = isKeyHotkey("mod+shift+x");

const KeyPlugin = () => ({
  onKeyDown(event, change, editor) {
    const markMatch = markHotkeys.find(([mark, hotkey]) => hotkey(event));
    if (markMatch) {
      event.preventDefault();
      return editor.onChange(MarkStrategy(editor.state.value, markMatch[0]));
    }

    const colorMatch = colorHotkeys.find(([mark, hotkey]) => hotkey(event));
    if (colorMatch) {
      event.preventDefault();
      return editor.onChange(ColorStrategy(editor.state.value, colorMatch[0]));
    }

    if (lastColorHotkey(event)) {
      event.preventDefault();
      return editor.onChange(ColorStrategy(editor.state.value));
    }
    if (isSelectionInTable(editor.state.value)) {
      if (isSelectionInList(editor.state.value)) {
        return EditListPlugin.onKeyDown(event, change, editor);
      } else {
        if (event.key === "Enter") {
          return change.insertBlock("paragraph");
        }
      }
    }

    return null;
  }
});

export default KeyPlugin;
