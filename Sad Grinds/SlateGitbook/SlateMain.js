import React from "react";
import PropTypes from "prop-types";
import { Editor } from "@gitbook/slate-react";
import { Value } from "@gitbook/slate";
import "./Slate.css";

import Configuration from "./Configuration";
import Toolbar from "./components/Toolbar";
import ErrorBoundary from "./components/ErrorBoundary";
import TableToolbarMenu from "./components/TableToolbarMenu";
import resizableGrid from "./tables/TableResizeStrategy";
import TableContextMenu from "./tables/TableContextMenu";

const LocalStorageKey = `travellist:content:${window.location.pathname}`;
const DefaultValue = {
  document: {
    nodes: [
      {
        object: "block",
        type: "heading-one",
        nodes: [
          {
            object: "text",
            leaves: [
              {
                text: "My Trip",
              },
            ],
          },
        ],
      },
      {
        object: "block",
        type: "paragraph",
        nodes: [
          {
            object: "text",
            leaves: [
              {
                text: "",
              },
            ],
          },
        ],
      },
    ],
  },
};

// slate value to be exported to BuilderMain
export var slateData;

export default class SlateEditor extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    className: PropTypes.string,
    title: PropTypes.element,
    onError: PropTypes.func,
  };

  static defaultProps = {
    placeholder: "Let's plan!...",
    className: "editor_object",
  };

  state = {
    mobileView: false,
    menus: {},
    debug: false,
    save: true,
    value: Value.fromJSON(
      JSON.parse(localStorage.getItem(LocalStorageKey)) || DefaultValue
    ),
  };

  /**
   * Load a value into the editor, for example when clearing changes
   *
   * @param {object} value - parsed into a SlateJS {Value}
   * @return {Promise} - fired after the editor has finished setting this value
   */
  // not used for now
  setValue(value) {
    return new Promise((resolve) => {
      this.setState({ value: Value.fromJSON(value) }, () => {
        resolve();
      });
    });
  }

  /**
   * On change, save the new `value`, and hide the color menu
   *
   * @param {Change} change
   */
  handleChange = ({ value }) => {
    const jsonContent = JSON.stringify(value.toJSON());

    if (this.state.debug) {
      console.log(jsonContent);
    }
    if (value.document !== this.state.value.document && this.state.save) {
      localStorage.setItem(LocalStorageKey, jsonContent);
    }
    this.setState({
      value,
      menus: {},
    });
  };

  handleClickUndo = (event) => {
    event.preventDefault();
    const change = this.state.value.change().undo();
    this.handleChange(change);
  };

  handleClickRedo = (event) => {
    event.preventDefault();
    const change = this.state.value.change().redo();
    this.handleChange(change);
  };

  handleMenuToggle = (event, type) => {
    event.preventDefault();
    const menus = {};
    if (!this.state.menus[type]) {
      menus[type] = true;
    }
    this.setState({ menus });
  };

  handleMobileToggle = (event) => {
    event.preventDefault();
    this.setState({ mobileView: !this.state.mobileView });
  };

  handleSaveToggle = (event) => {
    event.preventDefault();
    const saveState = this.state.save;
    if (saveState) {
      localStorage.removeItem(LocalStorageKey);
    } else {
      const jsonContent = JSON.stringify(this.state.value.toJSON());
      localStorage.setItem(LocalStorageKey, jsonContent);
    }
    this.setState({ save: !saveState });
  };

  // used to pass data from timeline to slate when the slate tab is clicked.
  // the tab will update the timelineData props which will trigger this update.
  componentDidUpdate(prevProps) {
    if (
      this.props.timelineData !== prevProps.timelineData &&
      this.props.timelineData !== undefined
    ) {
      this.setState({ value: Value.fromJSON(this.props.timelineData) });
    }
  }

  render() {
    // to be passed as props to the save button
    const handleSaveState = this.state.save;
    const { title, onError, placeholder, className } = this.props;
    const { menus, mobileView } = this.state;
    const value = this.state.value;
    slateData = this.state.value.toJSON();

    //table resize property
    var tables = document.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
      resizableGrid(tables[i]);
    }

    // custom context menu for tables
    const menu = document.querySelector(".tableToolbarMenu");
    const table = document.querySelector(".slate_table");
    TableContextMenu(menu, table);
    return (
      <ErrorBoundary onError={onError}>
        <div className={`travelSlate${mobileView ? "_mobile" : ""}`}>
          <TableToolbarMenu value={value} onChange={this.handleChange} />
          <Toolbar
            menus={menus}
            mobileView={mobileView}
            value={value}
            onChange={this.handleChange}
            onMenuToggle={this.handleMenuToggle}
            onMobileToggle={this.handleMobileToggle}
            onClickUndo={this.handleClickUndo}
            onClickRedo={this.handleClickRedo}
            onSaveToggle={this.handleSaveToggle}
            isSaved={handleSaveState}
          />
          {title}
          <div
            className="editor_container"
            ref={(editor) => {
              this.editor = editor;
            }}
          >
            <Editor
              placeholder={placeholder}
              className={className}
              value={value}
              onChange={this.handleChange}
              plugins={Configuration.plugins}
              schema={Configuration.schema}
              autoFocus
              spellCheck
            />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Public: Export JSON!
  serializeJSON = () => {
    return this.state.value.toJSON();
  };

  // Public: Export HTML from what the editor renders.
  // Avoid using slate-html-serializer for now, but may need to soon.
  serializeHTML = () => {
    return this.editor.querySelector("[data-slate-editor]").innerHTML;
  };

  // Deprecated! Public: Reset local storage, usually after the editor has saved via the DB
  clearStorage = () => {
    console.warn("Deprecated! No longer trusting localStorage.");
  };
}
