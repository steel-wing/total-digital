module.exports = [
  {
    "type": "heading",
    "defaultValue": "Total Digital Config"
  },
  {
    "type": "text",
    "defaultValue": "Clay with Rocky.js"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Colors"
      },
      {
        "type": "color",
        "messageKey": "BackgroundColor",
        "defaultValue": "0x000000",
        "label": "Background Color"
      },
      {
        "type": "color",
        "messageKey": "1Hour",
        "defaultValue": "0xFFFFFF",
        "label": "First Hour Color"
      },
      {
        "type": "color",
        "messageKey": "2Hour",
        "defaultValue": "0xFFFFFF",
        "label": "Second Hour Color"
      },
      {
        "type": "color",
        "messageKey": "1Colon",
        "defaultValue": "0xFFFFFF",
        "label": "First Colon Color"
      },
      {
        "type": "color",
        "messageKey": "1Minute",
        "defaultValue": "0xFFFFFF",
        "label": "First Minute Color"
      },
      {
        "type": "color",
        "messageKey": "2Minute",
        "defaultValue": "0xFFFFFF",
        "label": "Second Minute Color"
      },
      {
        "type": "color",
        "messageKey": "2Colon",
        "defaultValue": "0xFFFFFF",
        "label": "Second Colon Color"
      },
      {
        "type": "color",
        "messageKey": "1Second",
        "defaultValue": "0xFFFFFF",
        "label": "First Second Color"
      },
      {
        "type": "color",
        "messageKey": "2Second",
        "defaultValue": "0xFFFFFF",
        "label": "Second Second Color"
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Number and Cell Dimensions"
      },
      {
        "type": "slider",
        "messageKey": "stroke",
        "defaultValue": 5,
        "label": "Line Width",
        "description": "The thickness of each individual cell. Creates pixels when equal to cell width and height",
        "min": 1,
        "max": 50,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "diagonal",
        "defaultValue": 1,
        "label": "Diagonal Inset",
        "description": "The amount of corner inset on the edges of the cell. Set to 0 for rectangles and greater than stroke for funky stuff",
        "min": -50,
        "max": 50,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "spacing",
        "defaultValue": 2,
        "label": "Cell Spacing",
        "description": "The space in between each cell in a number. Set negative for overlaps",
        "min": -50,
        "max": 50,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "width",
        "defaultValue": 15,
        "label": "Horizontal Cell Width",
        "description": "The width of each horizontal cell",
        "min": 1,
        "max": 100,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "height",
        "defaultValue": 15,
        "label": "Vertical Cell Height",
        "description": "The height of each vertical cell",
        "min": 1,
        "max": 150,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "gap",
        "defaultValue": 4,
        "label": "Gap Width",
        "description": "The horizontal distance between adjacent numbers. Set negative for right > left stacking",
        "min": -20,
        "max": 20,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "xborder",
        "defaultValue": 5,
        "label": "Horizontal Border",
        "description": "The width of the border on the left and right sides of the display",
        "min": -50,
        "max": 50,
        "step": 1
      },
      {
        "type": "slider",
        "messageKey": "yborder",
        "defaultValue": 5,
        "label": "Vertical Border",
        "description": "The height of border on the top and bottom sides of the display",
        "min": -100,
        "max": 100,
        "step": 1
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Position and Additional Settings"
      },
      {
        "type": "radiogroup",
        "messageKey": "xJustify",
        "label": "Horizontal Justification",
        "options": [
          {
            "label": "Left",
            "value": "left"
          },
          {
            "label": "Center",
            "value": "center"
          },
          {
            "label": "Right",
            "value": "right"
          },
        ],
        "defaultValue": "center"
      },
      {
        "type": "radiogroup",
        "messageKey": "yJustify",
        "label": "Vertical Justification",
        "options": [
          {
            "label": "Top",
            "value": "top"
          },
          {
            "label": "Center",
            "value": "center"
          },
          {
            "label": "Bottom",
            "value": "bottom"
          },
        ],
        "defaultValue": "center"
      },
      {
        "type": "toggle",
        "messageKey": "xSquish",
        "label": "Dynamically Resize Width",
        "defaultValue": true,
        "description": "This makes your numbers thinner in the event of the clockface exceeding the bounds selected above (10:00 is wider than 1:00)"
      },
      {
        "type": "toggle",
        "messageKey": "ySquish",
        "label": "Dynamically Resize Height",
        "defaultValue": true,
        "description": "This makes your numbers shorter in the event of the clockface exceeding the bounds selected above (in the case of a timeline event)"
      },
      {
        "type": "toggle",
        "messageKey": "seconds",
        "label": "Display Seconds",
        "defaultValue": false
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];