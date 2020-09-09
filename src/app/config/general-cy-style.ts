export const GENERAL_CY_STYLE: any =
  [
    {
      selector: "node",
      style: {
        "background-opacity": 0,
        "font-size": "8px",
        "text-max-width": "44px",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-outline-color": "#555555",
        "text-outline-width": "2px",
        "color": "#FFFFFF",
      }
    },
    {
      selector: "edge",
      style: {
        "width": "3px",
        "font-size": "7px",
        "text-outline-color": "#555555",
        "text-outline-width": "1px",
        "text-rotation": "autorotate",
        "color": "#FFFFFF",
        "line-style": "solid",
        "curve-style": "bezier",
      }
    },
    {
      selector: "node.hover",
      style: {
        "background-opacity": 1,
        "background-fill": "radial-gradient",
        "background-gradient-stop-colors": "#e0f7fa #18ffff",
        "background-gradient-stop-positions": "0 50 100",
        "border-style": "dotted",
        "border-width": 3,
        "border-color": "#18ffff",
      }
    },
    {
      selector: "edge.hover",
      style: {
        "line-fill": "linear-gradient",
        "line-gradient-stop-colors": "#e0f7fa #006064",
        "line-gradient-stop-positions": "0 50 100",
        "line-style": "dashed",
        "line-dash-pattern": [1, 2],
        "line-dash-offset": 48,
        "transition-property": "line-dash-offset",
        "transition-duration": 3000
      }
    },
    {
      selector: "node:selected",
      style: {
        "overlay-color": "#BFBFBF",
        "overlay-opacity": 0.5,
        "overlay-padding": "6px",
      }
    },
    {
      selector: "edge:selected",
      style: {
        "overlay-color": "#BFBFBF",
        "overlay-padding": "6px",
        "overlay-opacity": 0.5,
      }
    },
    {
      selector: "node.Compound",
      style: {
        "background-opacity": 0.07,
        "background-color": "#555",
        "shape": "barrel",
        "border-color": "#263238",
        "font-size": "9px"
      }
    },
    {
      selector: "edge.cy-expand-collapse-collapsed-edge",
      style: {
        "font-size": "7px",
        "line-style": "dotted",
        "curve-style": "bezier",
        "line-fill": "linear-gradient",
        "line-gradient-stop-colors": "#e0f7fa #006064",
        "line-gradient-stop-positions": "0 50 100",
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#006064",
        "text-rotation": "autorotate"
      }
    },
  ];

