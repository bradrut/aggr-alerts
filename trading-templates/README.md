# trading-templates
In AGGR, trading templates are text files in JSON format which define custom workspaces. This directory is for tracking versions of any relevant trading templates where changes are being made.

Most notably, in addition to defining custom chart and pane layouts within the app, trading templates are where the crypto exchange sources for the chart are defined, which is most likely what may need updated.

## Using trading templates in AGGR
To upload a trading template to AGGR, thus creating a new Workspace in AGGR:
1. Open your AGGR instance
2. Click the button in the bottom right of the screen which is a green circle with three dots
3. Click **Settings**
4. Under **Workspaces**, click **New**, and select the trading template file

## Adding/modifying exchange sources in a trading template file
Towards the top of the JSON definition in the trading template file, you should see the following structure which defines the custom panes within the app:
```
...
states: {
  panes: {
    ...
    panes: {
      chart: {
        ...
        markets: [
          ...
        ]
      },
      liquidations: {
        ...
      },
      trades: {
        ...
      }
    }
  }
}
...
```

Each pane will have a `markets` array, which defines the market sources for that particular pane. So, if you want to updates the sources for the main chart, update the `markets` array within the `chart` pane object.

Some brief documentation on sources:
https://github.com/Tucsky/aggr/wiki/introduction-to-scripting#referencing-sources
