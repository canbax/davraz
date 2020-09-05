export const GENERAL_CY_STYLE: any =
  [
    {
      selector: "node.hover",
      style: {
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
        "line-dash-pattern": [1,2],
        "line-dash-offset": 48,
        "transition-property": "line-dash-offset",
        "transition-duration": 3000
      }
    }
  ];

