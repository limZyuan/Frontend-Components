import React, { Component } from "react";
import MaterialTable from "material-table";
import moment from "moment";
import { BuilderContext } from "./BuilderContext";

//used to create different draggable ids
var i = 1;

export default class Table extends Component {
  render() {
    return (
      <MaterialTable
        columns={[
          { title: "Time", field: "time" },
          { title: "Activity", field: "content" },
          { title: "Detail", field: "details" },
          { title: "Price", field: "cost" }
        ]}
        data={this.context.tableData}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  const data = this.context.data;
                  const content = newData["content"];
                  const time = newData["time"];
                  const details = newData["details"];
                  const cost = newData["cost"];
                  const id = oldData["id"];
                  console.log(oldData);
                  const taskdata = data["tasks"][id];
                  console.log(taskdata);
                  taskdata["content"] = content;
                  taskdata["time"] = time;
                  taskdata["details"] = details;
                  taskdata["cost"] = cost;
                  taskdata["id"] = id;

                  data["tasks"][id] = taskdata;

                  this.context.setData(data);

                  const tabledata = this.context.tableData;
                  const index = tabledata.indexOf(oldData);
                  tabledata[index] = newData;
                  this.context.setTableData(tabledata);

                  const timelinedata = this.context.timelineItems;
                  timelinedata[index]["title"] = content;
                  this.context.setTimelineItems(timelinedata);
                }
                resolve();
              }, 100);
            }),
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  const data = this.context.data;

                  const content = newData["content"];
                  const time = newData["time"];
                  const details = newData["details"];
                  const cost = newData["cost"];

                  var len = Object.keys(data.tasks).length;
                  const data_object = JSON.parse(
                    `{'id': 'task-${len +
                      i}', 'content': '${content}' ,'time': '${time}' ,'cost': '${cost}','details': '${details}'}`.replace(
                      /'/g,
                      '"'
                    )
                  );

                  data.tasks[`task-${len + i}`] = data_object;
                  data["columns"][this.context.tableTab]["taskIds"].push(
                    `task-${len + i}`
                  );

                  this.context.setData(data);

                  const tabledata = this.context.tableData;
                  newData["id"] = `task-${len + i}`;
                  tabledata.push(newData);
                  this.context.setTableData(tabledata);

                  var timelinelen = this.context.timelineItems.length;

                  const timelinedata = this.context.timelineItems;
                  const timeline_object = JSON.parse(
                    `{'id': ${timelinelen +
                      i},'group': ${1} ,'title': '${content}','start': '${moment()
                      .add(timelinelen, "hour")
                      .valueOf()}', 'end': '${moment()
                      .add(timelinelen + 1, "hour")
                      .valueOf()}'}`.replace(/'/g, '"')
                  );
                  console.log(timeline_object);
                  timelinedata.push(timeline_object);
                  console.log(timelinedata);
                  this.context.setTimelineItems(timelinedata);
                  i++;
                }
                resolve();
              }, 100);
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  const data = this.context.data;
                  const id = oldData["id"];

                  const columnindex = data["columns"][this.context.tableTab][
                    "taskIds"
                  ].indexOf(id);
                  data["columns"][this.context.tableTab]["taskIds"].splice(
                    columnindex,
                    1
                  );

                  this.context.setData(data);

                  let tabledata = this.context.tableData;
                  const index = tabledata.indexOf(oldData);
                  tabledata.splice(index, 1);
                  this.context.setTableData(tabledata);
                }
                resolve();
              }, 100);
            })
        }}
        title="My Trip"
        options={{
          pageSize: "10",
          headerStyle: {
            zIndex: 8
          }
        }}
        style={{
          top: "10px",
          right: "10px",
          padding: "20px",
          borderRadius: "20px"
        }}
      />
    );
  }
}

Table.contextType = BuilderContext;
