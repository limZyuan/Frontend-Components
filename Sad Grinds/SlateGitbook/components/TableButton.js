// Paste in prefabricated blocks from src/blocks
import React from "react";
import PropTypes from "prop-types";
import ToolbarButton from "../components/ToolbarButton";

import TableArrowTable from "../tables/table_arrow";
import TableTwoTable from "../tables/table_two";
import TableTravel from "../tables/table_travel";

const Tables = {
  table_arrow: TableArrowTable,
  table_two: TableTwoTable,
  table_travel: TableTravel
};

const prefabStrategy = (change, type) => change.insertBlock(Tables[type]);

const TableButton = ({ type, icon, title, value, insideTable, onChange }) => (
  <ToolbarButton
    icon={icon}
    title={title}
    text={title}
    onMouseDown={e => {
      return onChange(prefabStrategy(value.change(), type));
    }}
    active={insideTable}
  />
);

TableButton.propTypes = {
  type: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired,
  insideTable: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

export default TableButton;
