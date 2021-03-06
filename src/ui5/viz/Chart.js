/* @flow */

/**
 * UI development toolkit enhancement for HTML5 (OpenUI5)
 * (c) Copyright 2016 PulseShift GmbH, all rights reserved.
 * Created by Jascha Quintern (fuchsvomwalde) on 20. Jul 2016.
 */
sap.ui.define(
  [
    'sap/ui/core/Control',
    'ui5/viz/ChartAxis',
    'ui5/viz/ChartAxisLabel',
    './library',

    // libs
    'sap/ui/thirdparty/d3',
    'ps/libs/c3',
    'ps/libs/lodash'
  ],
  function(Control, ChartAxis, ChartAxisLabel, library) {
    /**
     * Constructor for a new <code>ui5.viz.Chart</code>.
     *
     * @param {string} [sId] Id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The <code>Chart</code> control: Chart container for bar, line and other chart types. Based on C3.js..
     *
     * @extends sap.ui.core.Control
     *
     * @author PulseShift GmbH
     * @version 1.0.0
     * @since: 1.0.0
     *
     * @constructor
     * @public
     * @alias ui5.viz.Chart
     */
    return Control.extend('ui5.viz.Chart', {
      /* =========================================================== */
      /* meta data definition                                        */
      /* =========================================================== */

      metadata: {
        library: 'ui5.viz',
        properties: {
          /* === Appearance === */

          /**
           * Shows or hides data series and legend
           * @since: 1.0.0
           */
          dataVisible: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: true
          },

          /**
           * A CSS size property defining the width of the chart
           * @since: 1.0.0
           */
          width: {
            type: 'sap.ui.core.CSSSize',
            group: 'Appearance',
            defaultValue: '100%'
          },

          /**
           * A CSS size property defining the hright of the chart
           * @since: 1.0.0
           */
          height: {
            type: 'sap.ui.core.CSSSize',
            group: 'Appearance',
            defaultValue: '360px'
          },

          /**
           * Shows a subchart for naviagtion
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          showSubchart: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: false
          },

          /**
           * Enables the chart to be displayed an a small scale
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          microMode: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: false
          },

          /**
           * Enables zoom functionality (inactive if subchart is used)
           * @since: 1.0.0
           */
          zoomEnabled: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: false
          },

          /**
           * If true, elements outside of the chart area (happend during zooming) is hidden
           * @since: 1.0.0
           */
          clipZoomOverflow: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: true
          },

          /**
           * If false, data points on lines or splines are hidden
           * @since: 1.0.0
           */
          showDataPoints: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: true
          },

          /**
           * Sets the background color of the chart
           * @since: 1.0.0
           */
          backgroundColor: {
            type: 'sap.ui.core.CSSColor',
            group: 'Appearance',
            defaultValue: 'transparent'
          },

          /**
           * Sets the legend position
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          legendPosition: {
            type: 'ui5.viz.ChartLegendPosition',
            group: 'Appearance',
            defaultValue: library.ChartLegendPosition.Right
          },

          /**
           * Sets tthe legend visibility
           * @since: 1.0.0
           */
          showLegend: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: false
          },

          /**
           * Enables tooltips on chart data elements
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          showTooltip: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: false
          },

          /**
           * Sets the tooltip behaviour, whether it should show tooltip for grouped or single data points
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          groupedTooltip: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: false
          },

          /**
           * Switches x (by default horizontally) and y (by default vertically) axis
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          switchAxisPosition: {
            type: 'boolean',
            group: 'Appearance',
            defaultValue: false
          },

          /* === Data === */

          /**
           * Set type of x axis
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          xAxisType: {
            type: 'ui5.viz.AxisType',
            group: 'Data',
            defaultValue: library.AxisType.Default
          }
        },
        aggregations: {
          /**
           * Chart axis (if no chart axis is supposed here, a default x axis is generated)
           * @since: 1.0.0
           */
          xAxis: { type: 'ui5.viz.ChartAxis', multiple: false },

          /**
           * Chart axis (if no chart axis is supposed here, a default y axis is generated)
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          yAxis: { type: 'ui5.viz.ChartAxis', multiple: false },

          /**
           * Chart axis (if no chart axis is provided, axis is not visible axis is generated)
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          y2Axis: { type: 'ui5.viz.ChartAxis', multiple: false },

          /**
           * Custom color for series, if not supposed, default theme colors are used
           * Hint: live update by c3 API is not supported, yet, therefore we must rerender the chart
           * @since: 1.0.0
           */
          colors: { type: 'ps.core.Color', multiple: true },

          /**
           * Set of lines to be displayed on the chart grid
           * @since: 1.0.0
           */
          lines: { type: 'ui5.viz.ChartLine', multiple: true },

          /**
           * Set of areas to be displayed on the chart grid
           * @since: 1.0.0
           */
          areas: { type: 'ui5.viz.ChartArea', multiple: true },

          /**
           * Defines the data series on our chart grid
           * @since: 1.0.0
           */
          series: { type: 'ui5.viz.ChartSeries', multiple: true }
        },
        defaultAggregation: 'series',
        associations: {},
        events: {
          /**
           * Data was updated
           */
          chartDataUpdate: {}
        }
      },

      /* =========================================================== */
      /* private attributes                                          */
      /* =========================================================== */

      /**
       * Reference to c3 chart instance
       * @type {object}
       * @since: 1.0.0
       */
      _chart: null,

      /**
       * Object to prevent update data event
       * @type {object}
       * @since: 1.0.0
       */
      _haltCount: 0,
      _initChartUpdateHandler() {
        const Chart = this
        Chart._haltCount = 0
      },
      _getChartUpdateHandler() {
        const Chart = this
        return {
          halt() {
            ++Chart._haltCount
            if (Chart._haltCount !== 0) {
              Chart.setBusy(true)
            }
          },
          release() {
            --Chart._haltCount
            if (Chart._haltCount === 0) {
              Chart.setBusy(false)
            }
          },
          isHalted() {
            return Chart._haltCount !== 0
          }
        }
      },

      /**
       * Number range object to set a unique key to series
       * @type {object}
       * @since: 1.0.0
       */
      _seriesNumberCount: 0,
      _initNumberRangeCreator() {
        const Chart = this
        Chart._seriesNumberCount = 0
      },
      _getNumberRangeCreator() {
        const Chart = this
        return {
          getNext() {
            return Chart._seriesNumberCount++
          }
        }
      },

      /**
       * Lodash debounce update chart method to increase performance.
       * @private
       * @type {function}
       */
      _debounceUpdate: null,

      /**
       * Lodash debounce update chart lines only method to increase performance.
       * @private
       * @type {function}
       */
      _debounceUpdateChartLines: null,

      /**
       * Lodash debounce update chart areas only method to increase performance.
       * @private
       * @type {function}
       */
      _debounceUpdateChartAreas: null,

      /* =========================================================== */
      /* constants                                                   */
      /* =========================================================== */

      /**
       * The base CSS class name of control <code>Chart</code>.
       * @private
       * @type {string}
       */
      CSS_CLASS: 'ui5-viz-chart',

      /**
       * Disable clip mode when zooming
       * @private
       * @type {string}
       */
      CSS_CLASS_NOCLIP: 'ui5-viz-chart-noclippath',

      /**
       * Highlight circle (data point) by pulsating
       * @private
       * @type {string}
       */
      CSS_HIGHLIGHT_PULSATE: 'ui5-viz-chart-point-highlight-pulsate',

      /**
       * Default class for lines
       * @private
       * @type {string}
       */
      CSS_CLASS_LINE: 'ui5-viz-chart-line',

      /**
       * Class for lines with icon only selector
       * @private
       * @type {string}
       */
      CSS_CLASS_LINE_SHOWSELECTOR: 'ui5-viz-chart-line-selector-visible',

      /**
       * Class for lines with icon only selector
       * @private
       * @type {string}
       */
      CSS_CLASS_LINE_ICONONLY: 'ui5-viz-chart-line-selector-icononly',

      /**
       * Default class for areas
       * @private
       * @type {string}
       */
      CSS_CLASS_AREA: 'ui5-viz-chart-area',

      /**
       * Default class for areas
       * @private
       * @type {string}
       */
      CSS_CLASS_NO_POINTS: 'ui5-viz-chart-hide-data-points',

      /**
       * Default class for areas
       * @private
       * @type {string}
       */
      CSS_CLASS_MICRO_MODE: 'ui5-viz-chart-micro-mode',

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * The init() method can be used to set up, for example, internal variables or subcontrols of a composite control.
       * If the init() method is implemented, SAPUI5 invokes the method for each control instance directly after the constructor method.
       * @private
       * @override
       */
      init() {
        // init private attributes
        this._initNumberRangeCreator()
        this._initChartUpdateHandler()
        this._chart = null

        // don't process update routine during initialization phase of control
        this._getChartUpdateHandler().halt()

        // init debounce update function instance
        this._debounceUpdate = _.debounce(this._onDataUpdate, 10)
        this._debounceUpdateChartLines = _.debounce(this._updateChartLines, 50)
        this._debounceUpdateChartAreas = _.debounce(this._updateChartAreas, 50)
      },

      /**
       * Constructor for a new <code>ui5.viz.Chart</code>.
       *
       * @param {string} [sId] Id for the new control, generated automatically if no id is given
       * @param {object} [mSettings] Initial settings for the new control
       */
      constructor() {
        Control.prototype.constructor.apply(this, arguments)

        // initialization phase finished, update routine is enabled again
        this._getChartUpdateHandler().release()
      },

      /**
       * Method called before control gets rendered
       * @private
       * @override
       */
      onBeforeRendering() {
        // don't process update routine rendering procedure
        this._getChartUpdateHandler().halt()

        // destroy chart before rerendering
        if (this._chart) {
          this._chart.destroy()
        }
      },

      /**
       * Renderer function of control <code>ui5.viz.Chart</code>.
       *
       * @param {object} [oRm] Render Manager
       * @param {object} [oControl] Current control (this)
       */
      renderer(oRm, oControl) {
        // start render wrapper div
        oRm.write('<div')
        oRm.writeControlData(oControl)
        oRm.addClass(oControl.CSS_CLASS)
        oRm.writeClasses()
        oRm.write('>')

        // end render wrapper div
        oRm.write('</div>')
      },

      /**
       * Method called after control gets rendered
       * @private
       * @override
       */
      onAfterRendering() {
        let oXAxis = this.getXAxis(),
          oYAxis = this.getYAxis(),
          oY2Axis = this.getY2Axis(),
          aSeries = this.getSeries(),
          aHighlightedDataPoints = []

        // enable/disable axis depending on microMode is active or not
        oXAxis.setProperty('visible', !this.getMicroMode(), true)
        oYAxis.setProperty('visible', !this.getMicroMode(), true)
        oY2Axis.setProperty('visible', !this.getMicroMode(), true)

        // because properties can't be take into account during rendering, we must process all properties and aggregations manually here

        // initialize c3 chart
        this._chart = c3.generate({
          bindto: `#${this.getId()}`,
          size: {
            width: this.getWidth(),
            // the x-axis title needs 15px more space, this must be calculated here
            height:
              this.getHeigth() -
              (oXAxis.getShowTitle() && oXAxis.getVisible() && oXAxis.getTitle()
                ? 15
                : 0)
          },
          // undefined will activate the automatic calculation of c3js
          padding: {
            top: this.getMicroMode() ? 0 : undefined,
            // the x-axis title needs 15px more space, this must be calculated here
            bottom:
              oXAxis.getShowTitle() && oXAxis.getVisible() && oXAxis.getTitle()
                ? 15
                : undefined,
            left: this.getMicroMode() ? 0 : undefined,
            right: this.getMicroMode() ? 0 : undefined
          },
          subchart: {
            show: this.getShowSubchart()
          },
          zoom: {
            enabled: this.getZoomEnabled()
          },
          legend: {
            position: this.getLegendPosition(),
            show: this.getShowLegend()
          },
          tooltip: {
            show: this.getShowTooltip(),
            grouped: this.getGroupedTooltip(),
            format: {
              value: (value, ratio, seriesKey, index) => {
                const oSeries = aSeries.find(
                  oSeries => oSeries.getKey() === seriesKey
                )
                const oDataPoint = oSeries ? oSeries.getData()[index] : null
                const sLabel = oDataPoint ? oDataPoint.getLabel() : value
                return sLabel ? sLabel : value
              },
              title: (() => {
                // check if an index based formatter function must be used or a time based formatter
                switch (this.getXAxisType()) {
                  // TIME BASED LABELS
                  case library.AxisType.Time:
                    return oDate => {
                      return sap.ui.core.format.DateFormat
                        .getInstance({ style: 'long' })
                        .format(oDate)
                    }
                  // INDEX BASED LABELS
                  case library.AxisType.Default:
                  default:
                    return iXIndex => {
                      const oLabel = oXAxis.getLabels()[iXIndex]
                      const sTitle =
                        oLabel.getTitle() === ''
                          ? oLabel.getValue()
                          : oLabel.getTitle()
                      // show nothing if label doesn't exist or if label is invisible
                      // if title is blank show value instead
                      return oLabel && oLabel.getVisible() ? sTitle : undefined // undefined will result in a hidden label (null is converted to string 'null')
                    }
                }
              })()
            }
          },
          data: {
            x: 'x',
            columns: [
              // add x axis values first
              ['x', ...oXAxis.getLabels().map(oLabel => oLabel.getValue())],
              // add series e.g. ['data1', 1, 4, 6, 8, 10, ...]
              ...aSeries.map(oSeries => {
                // get all data points
                let aData =
                  oSeries.getData().map((oDataPoint, iIndex) => {
                    // check if data point should be highlighted
                    let isVisible =
                      oDataPoint.getVisible() &&
                      oDataPoint.getValue() !== 'null' &&
                      oDataPoint.getValue()
                    if (
                      isVisible &&
                      oDataPoint.getHighlightAnimation() !==
                        library.DataPointAnimation.None
                    ) {
                      aHighlightedDataPoints.push({
                        series: oSeries.getKey(),
                        point: iIndex,
                        animation: oDataPoint.getHighlightAnimation()
                      })
                    }
                    return isVisible
                      ? parseInt(oDataPoint.getValue(), 10)
                      : null
                  }) || []

                // add key of data series
                aData.unshift(oSeries.getKey())

                // return series structure
                return aData // e.g. ['data1', 1, 4, 6, 8, 10, ...]
              })
            ],
            axes:
              aSeries.length === 0
                ? []
                : aSeries.reduce((oTypes, oSeries) => {
                    // return a map with the structure: { @seriesKey: @seriesYAxis, ... }
                    oTypes[oSeries.getKey()] = oSeries.getYAxis()
                    return oTypes
                  }, {}),
            types:
              aSeries.length === 0
                ? []
                : aSeries.reduce((oTypes, oSeries) => {
                    // return a map with the structure: { @seriesKey: @seriesType, ... }
                    oTypes[oSeries.getKey()] = oSeries.getType()
                    return oTypes
                  }, {}),
            names:
              aSeries.length === 0
                ? []
                : aSeries.reduce((oTypes, oSeries) => {
                    // return a map with the structure: { @seriesKey: @seriesName, ... }
                    oTypes[oSeries.getKey()] =
                      oSeries.getName() || oSeries.getKey()
                    return oTypes
                  }, {}),
            colors:
              aSeries.length === 0
                ? []
                : aSeries.reduce((oTypes, oSeries) => {
                    // return a map with the structure: { @seriesKey: @seriesColor, ... }
                    if (oSeries.getColor()) {
                      oTypes[oSeries.getKey()] = oSeries.getColor()
                    }
                    return oTypes
                  }, {}),
            labels: {
              format:
                aSeries.length === 0
                  ? []
                  : aSeries.reduce((oTypes, oSeries) => {
                      // return a map with the structure: { @seriesKey: @seriesFormatFunction, ... }
                      oTypes[oSeries.getKey()] = (value, seriesKey, index) => {
                        const sLabel = oSeries.getData()[index]
                          ? oSeries.getData()[index].getLabel()
                          : null
                        const sValidatedLabel = sLabel ? sLabel : value
                        // if showLabels = true then display label or value
                        return oSeries.getShowLabels() ? sValidatedLabel : null
                      }
                      return oTypes
                    }, {})
            },
            groups:
              aSeries.length === 0
                ? []
                : aSeries
                    .reduce((aGroups, oSeries) => {
                      // collect all group keys
                      if (
                        oSeries &&
                        oSeries.getGroupKey() &&
                        !aGroups.includes(oSeries.getGroupKey())
                      ) {
                        aGroups.push(oSeries.getGroupKey())
                      }
                      return aGroups
                    }, [])
                    .map(sGroupKey => {
                      // return for each group key the list of respective series keys (['data1', 'data2'])
                      return aSeries
                        .filter(oSeries => oSeries.getGroupKey() === sGroupKey)
                        .map(oSeries => oSeries.getKey())
                    })
          },
          color: {
            pattern: this.getColors().map(oColor => oColor.getColor()).concat(
              // retrieve custom color palette first if available
              library.ColorPalette.custom
                ? library.ColorPalette.custom
                : library.ColorPalette.Material300
            )
          },
          axis: {
            rotated: this.getSwitchAxisPosition(),
            x: {
              show: oXAxis.getVisible(),
              type: (() => {
                switch (this.getXAxisType()) {
                  case library.AxisType.Time:
                    return 'timeseries'

                  case library.AxisType.Default:
                  default:
                    return 'category'
                }
              })(),
              max: oXAxis.getMaxValue() ? oXAxis.getMaxValue() : undefined,
              min: oXAxis.getMinValue() ? oXAxis.getMinValue() : undefined,
              tick: {
                centered: false,
                // count: 10, >> this value should be set automatically
                // rotate: 45, >> c3js is a little bit buggy here, CSS solution may be required
                format: (() => {
                  // check if an index based formatter function must be used or a time based formatter
                  switch (this.getXAxisType()) {
                    // TIME BASED LABELS
                    case library.AxisType.Time:
                      return oDate => {
                        return sap.ui.core.format.DateFormat
                          .getInstance({ pattern: 'MMM yyyy' })
                          .format(oDate)
                      }
                    // INDEX BASED LABELS
                    case library.AxisType.Default:
                    default:
                      return iXIndex => {
                        const oLabel =
                          oXAxis.getLabels()[iXIndex] || new ChartAxisLabel()
                        const sTitle =
                          oLabel.getTitle() === ''
                            ? oLabel.getValue()
                            : oLabel.getTitle()
                        // show nothing if label doesn't exist or if label is invisible
                        // if title is blank show value instead
                        return oLabel && oLabel.getVisible()
                          ? sTitle
                          : undefined // undefined will result in a hidden label (null is converted to string 'null')
                      }
                  }
                })()
              },
              label: {
                text: oXAxis.getShowTitle() ? oXAxis.getTitle() : null,
                position: 'outer-center'
              }
            },
            y: {
              show: oYAxis.getVisible(),
              // inner: false,
              // default: max = highest y axis value
              max: oYAxis.getMaxValue()
                ? oYAxis.getMaxValue()
                : oYAxis
                    .getLabels()
                    .reduce(
                      (pre, curr) =>
                        Math.max(
                          pre === undefined ? -Infinity : pre,
                          parseInt(curr.getValue(), 10)
                        ),
                      undefined
                    ),
              // default: min = lowest y axis value
              min: oYAxis.getMinValue()
                ? oYAxis.getMinValue()
                : oYAxis
                    .getLabels()
                    .reduce(
                      (pre, curr) =>
                        Math.min(
                          pre === undefined ? Infinity : pre,
                          parseInt(curr.getValue(), 10)
                        ),
                      undefined
                    ),
              // inverted: false,
              // center: 0,
              padding: {
                top: this.getMicroMode() ? undefined : 0, // should maybe made configurable
                bottom: this.getMicroMode() ? undefined : 0
              },
              default: [
                // identify min and max value to set default range
                oYAxis.getMinValue()
                  ? oYAxis.getMinValue()
                  : oYAxis
                      .getLabels()
                      .reduce(
                        (pre, curr) =>
                          Math.min(
                            pre === undefined ? Infinity : pre,
                            parseInt(curr.getValue(), 10)
                          ),
                        undefined
                      ),
                oYAxis.getMaxValue()
                  ? oYAxis.getMaxValue()
                  : oYAxis
                      .getLabels()
                      .reduce(
                        (pre, curr) =>
                          Math.max(
                            pre === undefined ? -Infinity : pre,
                            parseInt(curr.getValue(), 10)
                          ),
                        undefined
                      )
              ],
              tick: {
                // count: 5, >> this value should be set automatically
                values:
                  oYAxis.getLabels().length > 0
                    ? oYAxis
                        .getLabels()
                        .map(oLabel => parseInt(oLabel.getValue(), 10))
                    : null,
                format: iYValue => {
                  const oLabel = oYAxis
                    .getLabels()
                    .find(oLabel => parseInt(oLabel.getValue(), 10) === iYValue)
                  if (!oLabel) {
                    // if no label exist, show value
                    return iYValue
                  }

                  const sTitle =
                    oLabel.getTitle() === ''
                      ? oLabel.getValue()
                      : oLabel.getTitle()

                  // show nothing if label is explicit invisible, else show title or value (if title is blank)
                  return oLabel.getVisible() ? sTitle : undefined // undefined will result in a hidden label (null is converted to string 'null')
                }
              },
              label: {
                text: oYAxis.getShowTitle() ? oYAxis.getTitle() : null,
                position: 'outer-middle'
              }
            },
            y2: {
              show: oY2Axis.getVisible(),
              // inner: false,
              max: oY2Axis.getMaxValue() ? oY2Axis.getMaxValue() : undefined,
              min: oY2Axis.getMinValue() ? oY2Axis.getMinValue() : undefined,
              // inverted: false,
              // center: 0,
              padding: {
                top: 0, // should maybe made configurable
                bottom: 0
              },
              default: [
                // identify min and max value to set default range
                oY2Axis.getMinValue()
                  ? oY2Axis.getMinValue()
                  : oY2Axis
                      .getLabels()
                      .reduce(
                        (pre, curr) =>
                          Math.min(
                            pre === undefined ? Infinity : pre,
                            parseInt(curr.getValue(), 10)
                          ),
                        undefined
                      ),
                oY2Axis.getMaxValue()
                  ? oY2Axis.getMaxValue()
                  : oY2Axis
                      .getLabels()
                      .reduce(
                        (pre, curr) =>
                          Math.max(
                            pre === undefined ? -Infinity : pre,
                            parseInt(curr.getValue(), 10)
                          ),
                        undefined
                      )
              ],
              tick: {
                // count: 5, >> this value should be set automatically
                values:
                  oY2Axis.getLabels().length > 0
                    ? oY2Axis
                        .getLabels()
                        .map(oLabel => parseInt(oLabel.getValue(), 10))
                    : null,
                format: iY2Value => {
                  const oLabel = oY2Axis
                    .getLabels()
                    .find(
                      oLabel => parseInt(oLabel.getValue(), 10) === iY2Value
                    )
                  if (!oLabel) {
                    // if no label exist, show value
                    return iY2Value
                  }

                  const sTitle =
                    oLabel.getTitle() === ''
                      ? oLabel.getValue()
                      : oLabel.getTitle()

                  // show nothing if label is explicit invisible, else show title or value (if title is blank)
                  return oLabel.getVisible() ? sTitle : undefined // undefined will result in a hidden label (null is converted to string 'null')
                }
              },
              label: {
                text: oY2Axis.getShowTitle() ? oY2Axis.getTitle() : null,
                position: 'outer-middle'
              }
            }
          },
          grid: {
            x: {
              show: oXAxis.getShowGridLines(),
              lines: this.getLines()
                .filter(
                  oLine =>
                    oLine.getVisible() && oLine.getAxis() === library.Axis.X
                )
                .map(oLine => {
                  return this._mapChartLineToC3Line(oLine)
                })
            },
            y: {
              show: oYAxis.getShowGridLines(),
              lines: this.getLines()
                .filter(
                  oLine =>
                    oLine.getVisible() && oLine.getAxis() !== library.Axis.X
                )
                .map(oLine => {
                  return this._mapChartLineToC3Line(oLine)
                })
            }
          },
          regions: this.getAreas()
            .filter(oArea => oArea.getVisible())
            .map(oArea => {
              return {
                id: oArea.getId(),
                start: oArea.getStartValue(),
                end: oArea.getEndValue(),
                axis: oArea.getAxis(),
                text: oArea.getTitle(),
                // position: oArea.getTitlePosition(),
                // add three classes: general line class, line style class and line identifier
                class:
                  this.CSS_CLASS_AREA +
                  ' ' +
                  this.CSS_CLASS_AREA +
                  '-' +
                  oArea.getId()
              }
            }),
          transition: {
            duration: 175
          }
        })

        // >>> continue styling

        // highlight data ponts
        d3
          .selectAll(`#${this.getId()} g.c3-circles circle.c3-circle`)
          .classed(this.CSS_HIGHLIGHT_PULSATE, false)
        if (aHighlightedDataPoints.length > 0) {
          aHighlightedDataPoints.forEach(oHighlightInfo => {
            d3
              .select(
                `#${this.getId()} g.c3-circles-${oHighlightInfo.series} circle.c3-circle-${oHighlightInfo.point}`
              )
              .classed(this.CSS_HIGHLIGHT_PULSATE, true)
          })
        }

        // set series style for shape areas
        this._updateSeriesStyles()

        // update line styles
        this._updateLineStyles()

        // update area styles
        this._updateAreaStyles()

        // set clippath of zoom overflow area
        if (this.getClipZoomOverflow()) {
          this.removeStyleClass(this.CSS_CLASS_NOCLIP)
        } else {
          this.addStyleClass(this.CSS_CLASS_NOCLIP)
        }

        // set background color
        if (this.getDomRef())
          $(this.getDomRef()).css('background-color', this.getBackgroundColor())

        // attach on window resize handler
        $(window).resize(this._resize.bind(this))

        // call resize after a little delay, because sometimes the parent view needs some time until transition to full size finished
        setTimeout(() => {
          this._resize()
        }, 150)
        setTimeout(() => {
          this._resize()
        }, 1500)

        // enable update loop, again
        this._getChartUpdateHandler().release()
      },

      /**
       * The exit() method is used to clean up resources and to deregister event handlers.
       * If the exit() method is implemented, SAPUI5 core invokes the method for each control instance when it is destroyed.
       * @private
       * @override
       */
      exit() {},

      /* =========================================================== */
      /* override methods                                            */
      /* =========================================================== */

      /**
       * Setter for property <code>dataVisible</code>.
       *
       * @param {boolean} bDataVisible Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setDataVisible(bDataVisible) {
        if (this._chart) bDataVisible ? this._chart.show() : this._chart.hide()
        return this.setProperty('dataVisible', bDataVisible, true) // do not rerender
      },

      /**
       * Setter for property <code>width</code>.
       *
       * @param sWidth {sap.ui.core.CSSSize} Expects a sap.ui.core.CSSSize element
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setWidth(sWidth) {
        this.setProperty('width', sWidth, true) // do not rerender
        this._chart ? this._chart.resize({ width: this.getWidth() }) : undefined
        return this
      },

      /**
       * Setter for property <code>height</code>.
       *
       * @param sHeight {sap.ui.core.CSSSize} Expects a sap.ui.core.CSSSize element
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setHeight(sHeight) {
        this.setProperty('height', sHeight, true) // do not rerender
        this._chart
          ? this._chart.resize({ height: this.getHeigth() })
          : undefined
        return this
      },

      /**
       * Getter for property <code>width</code>.
       *
       * @return {number} Returns calculated size in pixel value based on sap.ui.core.CSSSize element
       * @public
       */
      getWidth() {
        return this._getComputedSize(this.getProperty('width'), 'width')
      },

      /**
       * Getter for property <code>height</code>.
       *
       * @return {number} Returns calculated size in pixel value based on sap.ui.core.CSSSize element
       * @public
       */
      getHeigth() {
        return this._getComputedSize(this.getProperty('height'), 'height')
      },

      /**
       * Setter for property <code>showSubchart</code>.
       *
       * @param bShowSubchart {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setShowSubchart(bShowSubchart) {
        // live update by c3 API is not working, yet, therefore we must rerender the chart
        // if (this._chart) this._chart.subchart = { show: bShowSubchart };
        return this.setProperty('showSubchart', bShowSubchart, false) // force rerender
      },

      /**
       * Setter for property <code>microMode</code>.
       *
       * @param bMicroMode {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setMicroMode(bMicroMode) {
        if (bMicroMode) {
          this.addStyleClass(this.CSS_CLASS_MICRO_MODE)
        } else {
          this.removeStyleClass(this.CSS_CLASS_MICRO_MODE)
        }

        // Hint: disable/enable all axis is done in update and onAfterRendering method

        return this.setProperty('microMode', bMicroMode, false) // force rerender
      },

      /**
       * Setter for property <code>zoomEnabled</code>.
       *
       * @param bZoomEnabled {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setZoomEnabled(bZoomEnabled) {
        if (this._chart) this._chart.zoom.enable(bZoomEnabled)
        return this.setProperty('zoomEnabled', bZoomEnabled, true) // do not rerender
      },

      /**
       * Setter for property <code>clipZoomOverflow</code>.
       *
       * @param bClipZoomOverflow {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setClipZoomOverflow(bClipZoomOverflow) {
        if (bClipZoomOverflow) {
          this.removeStyleClass(this.CSS_CLASS_NOCLIP)
        } else {
          this.addStyleClass(this.CSS_CLASS_NOCLIP)
        }
        return this.setProperty('clipZoomOverflow', bClipZoomOverflow, true) // do not rerender
      },

      /**
       * Setter for property <code>showDataPoints</code>.
       *
       * @param bShowDataPoints {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setShowDataPoints(bShowDataPoints) {
        if (bShowDataPoints) {
          this.removeStyleClass(this.CSS_CLASS_NO_POINTS)
        } else {
          this.addStyleClass(this.CSS_CLASS_NO_POINTS)
        }
        return this.setProperty('showDataPoints', bShowDataPoints, true) // do not rerender
      },

      /**
       * Setter for property <code>backgroundColor</code>.
       *
       * @param sBackgroundColor {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setBackgroundColor(sBackgroundColor) {
        if (this.getDomRef())
          $(this.getDomRef()).css('background-color', sBackgroundColor)
        return this.setProperty('backgroundColor', sBackgroundColor, true) // do not rerender
      },

      /**
       * Setter for property <code>legendPosition</code>.
       *
       * @param sLegendPosition {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setLegendPosition(sLegendPosition) {
        // live update by c3 API is not working, yet, therefore we must rerender the chart
        // TODO: check if custom modification is possible: c3.chart.fn.legend.position = function (position) { ... }
        // if (this._chart) this._chart.legend.position = sLegendPosition;
        return this.setProperty('legendPosition', sLegendPosition, false) // force rerender
      },

      /**
       * Setter for property <code>showLegend</code>.
       *
       * @param bShowLegend {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setShowLegend(bShowLegend) {
        if (this._chart)
          bShowLegend ? this._chart.legend.show() : this._chart.legend.hide()
        return this.setProperty('showLegend', bShowLegend, true) // do not rerender
      },

      /**
       * Setter for property <code>showTooltip</code>.
       *
       * @param bShowTooltip {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setShowTooltip(bShowTooltip) {
        // live update by c3 API is not working, yet, therefore we must rerender the chart
        // if (this._chart) bShowTooltip ? this._chart.tooltip.show() : this._chart.tooltip.hide();
        return this.setProperty('showTooltip', bShowTooltip, false) // force rerender
      },

      /**
       * Setter for property <code>groupedTooltip</code>.
       *
       * @param bGroupedTooltip {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setGroupedTooltip(bGroupedTooltip) {
        // live update by c3 API is not working, yet, therefore we must rerender the chart
        // if (this._chart) this._chart.tooltip.grouped = bGroupedTooltip;
        return this.setProperty('groupedTooltip', bGroupedTooltip, false) // force rerender
      },

      /**
       * Setter for property <code>switchAxisPosition</code>.
       *
       * @param bSwitchAxisPosition {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setSwitchAxisPosition(bSwitchAxisPosition) {
        // live update by c3 API is not working, yet, therefore we must rerender the chart
        // if (this._chart) this._chart.axis.rotated = bSwitchAxisPosition;
        return this.setProperty(
          'switchAxisPosition',
          bSwitchAxisPosition,
          false
        ) // force rerender
      },

      /**
       * Setter for property <code>xAxisType</code>.
       *
       * @param bXAxisType {boolean} Expects a boolean
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @public
       */
      setXAxisType(bXAxisType) {
        // live update by c3 API is not working, yet, therefore we must rerender the chart
        return this.setProperty('xAxisType', bXAxisType, false) // force rerender
      },

      /**
       * Getter for aggregation <code>xAxis</code>.
       *
       * @return {ui5.viz.ChartAxis} return x axis
       * @public
       */
      getXAxis() {
        let iSeriesTicks, iAxisTicks, iDeltaTicks, oXAxis

        oXAxis = this.getAggregation('xAxis')
        if (!oXAxis) {
          oXAxis = new ChartAxis()
          this.setAggregation('xAxis', oXAxis, true) // do not rerender
        }

        // get maximal axis ticks
        iSeriesTicks = Math.max.apply(
          Math,
          this.getSeries().length === 0
            ? [0]
            : this.getSeries().map(oSeries => oSeries.getData().length)
        )

        // add missing ticks if required
        iAxisTicks = oXAxis.getLabels().length

        if (iAxisTicks < iSeriesTicks) {
          iDeltaTicks = iSeriesTicks - iAxisTicks
          for (let i = 0; i <= iDeltaTicks; i++) {
            // add label without fire update event
            Control.prototype.addAggregation.call(
              oXAxis,
              'labels',
              new ChartAxisLabel({ value: iAxisTicks + i }),
              true
            )
          }
        }

        return oXAxis
      },

      /**
       * Getter for aggregation <code>yAxis</code>.
       *
       * @return {ui5.viz.ChartAxis} return y axis
       * @public
       */
      getYAxis() {
        let oYAxis

        oYAxis = this.getAggregation('yAxis')
        if (!oYAxis) {
          oYAxis = new ChartAxis()
          this.setAggregation('yAxis', oYAxis, true) // do not rerender
        }

        return oYAxis
      },

      /**
       * Getter for aggregation <code>y2Axis</code>.
       *
       * @return {ui5.viz.ChartAxis} return y2 axis
       * @public
       */
      getY2Axis() {
        let oY2Axis

        oY2Axis = this.getAggregation('y2Axis')
        if (!oY2Axis) {
          oY2Axis = new ChartAxis({
            visible: false
          })
          this.setAggregation('y2Axis', oY2Axis, true) // do not rerender
        }

        return oY2Axis
      },

      /**
       * Sets a new object in the named 0..1 aggregation of this ManagedObject and marks this ManagedObject as changed.
       *
       * @param sAggregationName {string} the string identifying the aggregation the managed object oObject should be set.
       * @param oObject {sap.ui.base.ManagedObject} the ManagedObject to add; if empty, nothing is inserted.
       * @param bSuppressInvalidate {boolean} if true, this ManagedObject as well as the added child are not marked as changed
       * @return {ui5.viz.ChartSeries} This instance for chaining
       * @public
       */
      setAggregation(sAggregationName, oObject, bSuppressInvalidate) {
        if (oObject) {
          // set internal axis type
          switch (sAggregationName) {
            case 'xAxis':
              oObject.setProperty('_axisType', library.Axis.X, true)
              break
            case 'yAxis':
              oObject.setProperty('_axisType', library.Axis.Y, true)
              break
            case 'y2Axis':
              oObject.setProperty('_axisType', library.Axis.Y2, true)
              break
            default:
              break
          }
        }

        if (['xAxis', 'yAxis', 'y2Axis2'].includes(sAggregationName)) {
          // other than the CHartSeries, we must rerender the chart when an Axis is added, because not all attributes/aggregations can be updated via c3js API, yet
          Control.prototype.setAggregation.call(
            this,
            sAggregationName,
            oObject,
            false
          ) // force rerender

          // forward dataUpdate event
          if (oObject) {
            oObject.attachAxisUpdate(oEvent =>
              this._onDataUpdateByCode(oEvent.getParameter('code'))
            )
          }
        } else {
          Control.prototype.setAggregation.call(
            this,
            sAggregationName,
            oObject,
            bSuppressInvalidate
          )
        }

        return this
      },

      /**
       * Inserts managed object oObject to the aggregation named sAggregationName at position iIndex.
       *
       * @param sAggregationName {string} the string identifying the aggregation the managed object oObject should be inserted into.
       * @param oObject {sap.ui.base.ManagedObject} the ManagedObject to add; if empty, nothing is inserted.
       * @param iIndex {int} the 0-based index the managed object should be inserted at; for a negative value iIndex, oObject is inserted at position 0; for a value greater than the current size of the aggregation, oObject is inserted at the last position
       * @param bSuppressInvalidate {boolean} if true, this ManagedObject as well as the added child are not marked as changed
       * @return {ui5.viz.ChartSeries} This instance for chaining
       * @public
       */
      insertAggregation(
        sAggregationName,
        oObject,
        iIndex,
        bSuppressInvalidate
      ) {
        // set initial unique key if not happened, yet
        if (sAggregationName === 'series' && !oObject.getKey()) {
          oObject.setKey(this._getNumberRangeCreator().getNext())
        }

        // Hint: because, data.format can't be updated by c3js api, yet, we must rerender the chart, when a new aggregation was added
        if (['lines', 'areas'].includes(sAggregationName)) {
          // important: update value, before fire event
          Control.prototype.insertAggregation.call(
            this,
            sAggregationName,
            oObject,
            iIndex,
            true
          )

          // forward aggregation update events & inform observers about data update
          switch (sAggregationName) {
            // case 'series':
            //     oObject.attachSeriesDataUpdate(oEvent => this._onDataUpdateByCode(oEvent.getParameter('code')));
            //     oObject.attachSeriesVisibilityChange(this._onSeriesVisibilityUpdate.bind(this));
            //     this._onDataUpdateByCode(library.ChartUpdateCode.DataPoint);
            //     break;
            case 'lines':
              oObject.attachLineUpdate(oEvent =>
                this._onDataUpdateByCode(oEvent.getParameter('code'))
              )
              this._onDataUpdateByCode(library.ChartUpdateCode.Line)
              break
            case 'areas':
              oObject.attachAreaUpdate(oEvent =>
                this._onDataUpdateByCode(oEvent.getParameter('code'))
              )
              this._onDataUpdateByCode(library.ChartUpdateCode.Area)
              break
            default:
              break
          }
        } else {
          Control.prototype.insertAggregation.call(
            this,
            sAggregationName,
            oObject,
            iIndex,
            bSuppressInvalidate
          )
        }

        return this
      },

      /**
       * Adds some entity oObject to the aggregation identified by sAggregationName.
       *
       * @param sAggregationName {string} the string identifying the aggregation the managed object oObject should be inserted into.
       * @param oObject {sap.ui.base.ManagedObject} the ManagedObject to add; if empty, nothing is inserted.
       * @param bSuppressInvalidate {boolean} if true, this ManagedObject as well as the added child are not marked as changed
       * @return {ui5.viz.ChartSeries} This instance for chaining
       * @public
       */
      addAggregation(sAggregationName, oObject, bSuppressInvalidate) {
        // set initial unique key if not happened, yet
        if (sAggregationName === 'series' && !oObject.getKey()) {
          oObject.setKey(this._getNumberRangeCreator().getNext())
        }

        // Hint: because, data.format can't be updated by c3js api, yet, we must rerender the chart, when a new aggregation was added
        if (['lines', 'areas'].includes(sAggregationName)) {
          // important: update value, before fire event
          Control.prototype.addAggregation.call(
            this,
            sAggregationName,
            oObject,
            true
          )

          // forward aggregation update events & inform observers about data update
          switch (sAggregationName) {
            // case 'series':
            //     oObject.attachSeriesDataUpdate(oEvent => this._onDataUpdateByCode(oEvent.getParameter('code')));
            //     oObject.attachSeriesVisibilityChange(this._onSeriesVisibilityUpdate.bind(this));
            //     this._onDataUpdateByCode(library.ChartUpdateCode.DataPoint);
            //     break;
            case 'lines':
              oObject.attachLineUpdate(oEvent =>
                this._onDataUpdateByCode(oEvent.getParameter('code'))
              )
              this._onDataUpdateByCode(library.ChartUpdateCode.Line)
              break
            case 'areas':
              oObject.attachAreaUpdate(oEvent =>
                this._onDataUpdateByCode(oEvent.getParameter('code'))
              )
              this._onDataUpdateByCode(library.ChartUpdateCode.Area)
              break
            default:
              break
          }
        } else {
          Control.prototype.addAggregation.call(
            this,
            sAggregationName,
            oObject,
            bSuppressInvalidate
          )
        }

        return this
      },

      /**
       * Removes an object from the aggregation named sAggregationName with cardinality 0..n.
       *
       * @param sAggregationName {string} the string identifying the aggregation the managed object oObject should be inserted into.
       * @param oObject {sap.ui.base.ManagedObject} the ManagedObject to add; if empty, nothing is inserted.
       * @param bSuppressInvalidate {boolean} if true, this ManagedObject as well as the added child are not marked as changed
       * @return {ui5.viz.ChartSeries} This instance for chaining
       * @public
       */
      removeAggregation(sAggregationName, oObject, bSuppressInvalidate) {
        if (['series', 'lines', 'areas'].includes(sAggregationName)) {
          // important: update value, before fire event
          Control.prototype.removeAggregation.call(
            this,
            sAggregationName,
            oObject,
            true
          )

          // forward aggregation update events & inform observers about data update
          switch (sAggregationName) {
            case 'series':
              this._onDataUpdateByCode(library.ChartUpdateCode.DataPoint)
              break
            case 'lines':
              this._onDataUpdateByCode(library.ChartUpdateCode.Line)
              break
            case 'areas':
              this._onDataUpdateByCode(library.ChartUpdateCode.Area)
              break
            default:
              break
          }
        } else {
          Control.prototype.removeAggregation.call(
            this,
            sAggregationName,
            oObject,
            bSuppressInvalidate
          )
        }

        return this
      },

      /**
       * Removes all objects from the 0..n-aggregation named sAggregationName.
       *
       * @param sAggregationName {string} the string identifying the aggregation the managed object oObject should be inserted into.
       * @param bSuppressInvalidate {boolean} if true, this ManagedObject as well as the added child are not marked as changed
       * @return {ui5.viz.ChartSeries} This instance for chaining
       * @public
       */
      removeAllAggregation(sAggregationName, bSuppressInvalidate) {
        if (['series', 'lines', 'areas'].includes(sAggregationName)) {
          // important: update value, before fire event
          Control.prototype.removeAllAggregation.call(
            this,
            sAggregationName,
            true
          )

          // forward aggregation update events & inform observers about data update
          switch (sAggregationName) {
            case 'series':
              this._onDataUpdateByCode(library.ChartUpdateCode.DataPoint)
              break
            case 'lines':
              this._onDataUpdateByCode(library.ChartUpdateCode.Line)
              break
            case 'areas':
              this._onDataUpdateByCode(library.ChartUpdateCode.Area)
              break
            default:
              break
          }
        } else {
          Control.prototype.removeAllAggregation.call(
            this,
            sAggregationName,
            bSuppressInvalidate
          )
        }

        return this
      },

      /**
       * Destroys (all) the managed object(s) in the aggregation named sAggregationName and empties the aggregation. If the aggregation did contain any object, this ManagedObject is marked as changed.
       *
       * @param sAggregationName {string} the string identifying the aggregation the managed object oObject should be inserted into.
       * @param bSuppressInvalidate {boolean} if true, this ManagedObject as well as the added child are not marked as changed
       * @return {ui5.viz.ChartSeries} This instance for chaining
       * @public
       */
      destroyAggregation(sAggregationName, bSuppressInvalidate) {
        if (['series', 'lines', 'areas'].includes(sAggregationName)) {
          // important: update value, before fire event
          Control.prototype.destroyAggregation.call(
            this,
            sAggregationName,
            true
          )

          // forward aggregation update events & inform observers about data update
          switch (sAggregationName) {
            case 'series':
              this._onDataUpdateByCode(library.ChartUpdateCode.DataPoint)
              break
            case 'lines':
              this._onDataUpdateByCode(library.ChartUpdateCode.Line)
              break
            case 'areas':
              this._onDataUpdateByCode(library.ChartUpdateCode.Area)
              break
            default:
              break
          }
        } else {
          Control.prototype.destroyAggregation.call(
            this,
            sAggregationName,
            bSuppressInvalidate
          )
        }

        return this
      },

      /**
       * Sets or unsets a model for the given model name for this ManagedObject.
       *
       * @param {sap.ui.model.Model} [oModel] The model to be set or null or undefined.
       * @param {string} [sName] The name of the model or undefined.
       * @returns {ui5.viz.ChartSeries} This instance for chaining.
       * @public
       */
      setModel(oModel, sName) {
        // to improve performance, we disable chart update until the complete model was assigned
        this._getChartUpdateHandler().halt()

        Control.prototype.setModel.apply(this, arguments)

        this._getChartUpdateHandler().release()

        // trigger update method manually
        this._onDataUpdateByCode()

        return this
      },

      /* =========================================================== */
      /* public methods                                              */
      /* =========================================================== */

      /* =========================================================== */
      /* private methods                                             */
      /* =========================================================== */

      /**
       * Update chart data by update code.
       *
       * @param {string} [sCode] Update code
       * @private
       */
      _onDataUpdateByCode(sCode) {
        // don't call update routine if it is halted by someone or chart is not initialized, yet
        if (this._getChartUpdateHandler().isHalted()) {
          return
        } else if (!this._chart) {
          this.rerender()
          return
        }

        // TODO: Finish switch case statement to check which part should be updated
        switch (sCode) {
          case library.ChartUpdateCode.Line:
            // update chart lines only
            this._debounceUpdateChartLines()

            // inform observers about data update
            this.fireChartDataUpdate()
            break

          case library.ChartUpdateCode.Area:
            // update chart areas only
            this._debounceUpdateChartAreas()

            // inform observers about data update
            this.fireChartDataUpdate()
            break

          default:
            // update almost everything but debounced, to collect several update requests
            this._debounceUpdate()

            // inform observers about data update
            this.fireChartDataUpdate()
            break
        }
      },

      /**
       * Update chart data. This method shoud only be called in a debounced mode.
       *
       * @private
       */
      _onDataUpdate() {
        // console.error('UPDATE THE CHART');

        const aSeries = this.getSeries()
        const aSeriesKeys = aSeries.map(oSeries => oSeries.getKey())
        const aNewSeries = aSeriesKeys.filter(
          sKey =>
            this._chart
              .data()
              .map(oSeries => oSeries.id)
              .every(sId => sId === sKey) === false
        )
        const aObsoleteSeries = this._chart
          .data()
          .map(oSeries => oSeries.id)
          .filter(sId => aSeriesKeys.some(sKey => sKey === sId) === false)
        const aHighlightedDataPoints = []
        const oXAxis = this.getXAxis()
        const oYAxis = this.getYAxis()
        const oY2Axis = this.getY2Axis()

        // check if new series have been added, if yes, we must stop update method and rerender control, because data.format can't be updated by c3js api, yet
        if (aNewSeries.length > 0 || aObsoleteSeries.length > 0) {
          this.rerender()
          return
        }

        // enable/disable axis depending on microMode is active or not (call on Control to prevent fire update event)
        Control.prototype.setProperty.call(
          oXAxis,
          'visible',
          !this.getMicroMode(),
          true
        )
        Control.prototype.setProperty.call(
          oYAxis,
          'visible',
          !this.getMicroMode(),
          true
        )
        Control.prototype.setProperty.call(
          oY2Axis,
          'visible',
          !this.getMicroMode(),
          true
        )

        // 1. unload series, not used anymore
        this._chart.unload(aObsoleteSeries)

        // 2. load new series and new data
        this._chart.load({
          // update series data
          x: 'x',
          columns: [
            // add x axis values first
            ['x', ...oXAxis.getLabels().map(oLabel => oLabel.getValue())],
            // add series e.g. ['data1', 1, 4, 6, 8, 10, ...]
            ...aSeries.map(oSeries => [
              // get key (e.g. 'data1')
              oSeries.getKey(),
              // get data points (e.g. [1, 4, 6, 8, 10, ...])
              ...oSeries.getData().map((oDataPoint, iIndex) => {
                // check if data point should be highlighted
                let isVisible =
                  oDataPoint.getVisible() &&
                  oDataPoint.getValue() !== 'null' &&
                  oDataPoint.getValue()
                if (
                  isVisible &&
                  oDataPoint.getHighlightAnimation() !==
                    library.DataPointAnimation.None
                ) {
                  aHighlightedDataPoints.push({
                    series: oSeries.getKey(),
                    point: iIndex,
                    animation: oDataPoint.getHighlightAnimation()
                  })
                }
                return isVisible ? parseInt(oDataPoint.getValue(), 10) : null
              })
            ])
          ],

          // update axis assignment
          axes:
            aSeries.length === 0
              ? []
              : aSeries.reduce((oTypes, oSeries) => {
                  // return a map with the structure: { @seriesKey: @seriesYAxis, ... }
                  oTypes[oSeries.getKey()] = oSeries.getYAxis()
                  return oTypes
                }, {}),

          // update series types
          types:
            aSeries.length === 0
              ? []
              : aSeries.reduce((oTypes, oSeries) => {
                  // return a map with the structure: { @seriesKey: @seriesType, ... }
                  oTypes[oSeries.getKey()] = oSeries.getType()
                  return oTypes
                }, {}),

          // update series names
          names:
            aSeries.length === 0
              ? []
              : aSeries.reduce((oTypes, oSeries) => {
                  // return a map with the structure: { @seriesKey: @seriesName, ... }
                  oTypes[oSeries.getKey()] =
                    oSeries.getName() || oSeries.getKey()
                  return oTypes
                }, {}),

          // update series colors
          colors:
            aSeries.length === 0
              ? []
              : aSeries.reduce((oTypes, oSeries) => {
                  // return a map with the structure: { @seriesKey: @seriesColor, ... }
                  if (oSeries.getColor()) {
                    oTypes[oSeries.getKey()] = oSeries.getColor()
                  }
                  return oTypes
                }, {})
        })

        // highlight data points
        d3
          .selectAll(`#${this.getId()} g.c3-circles circle.c3-circle`)
          .classed(this.CSS_HIGHLIGHT_PULSATE, false)
        if (aHighlightedDataPoints.length > 0) {
          aHighlightedDataPoints.forEach(oHighlightInfo => {
            d3
              .select(
                `#${this.getId()} g.c3-circles-${oHighlightInfo.series} circle.c3-circle-${oHighlightInfo.point}`
              )
              .classed(this.CSS_HIGHLIGHT_PULSATE, true)
          })
        }

        // update groups
        this._chart.groups(
          aSeries.length === 0
            ? []
            : aSeries
                .reduce((aGroups, oSeries) => {
                  // collect all group keys
                  if (
                    oSeries &&
                    oSeries.getGroupKey() &&
                    !aGroups.includes(oSeries.getGroupKey())
                  ) {
                    aGroups.push(oSeries.getGroupKey())
                  }
                  return aGroups
                }, [])
                .map(sGroupKey => {
                  // return for each group key the list of respective series keys (['data1', 'data2'])
                  return aSeries
                    .filter(oSeries => oSeries.getGroupKey() === sGroupKey)
                    .map(oSeries => oSeries.getKey())
                })
        )

        // update series styles
        this._updateSeriesStyles()

        // update axis titles
        this._chart.axis.labels({
          x: oXAxis.getShowTitle() ? oXAxis.getTitle() : null,
          y: oYAxis.getShowTitle() ? oYAxis.getTitle() : null,
          y2: oY2Axis.getShowTitle() ? oY2Axis.getTitle() : null
        })

        this._chart.axis.showX(oXAxis.getVisible())
        this._chart.axis.showY(oYAxis.getVisible())
        this._chart.axis.showY2(oY2Axis.getVisible())

        // update min/max for y axis
        // TODO: Check why change of x axis range is not working without rerender (simple examples are working)
        this._chart.axis.range({
          min: {
            X: oXAxis.getMinValue() ? oXAxis.getMinValue() : undefined,
            y: oYAxis.getMinValue()
              ? oYAxis.getMinValue()
              : oYAxis
                  .getLabels()
                  .reduce(
                    (pre, curr) =>
                      Math.min(
                        pre === undefined ? Infinity : pre,
                        parseInt(curr.getValue(), 10)
                      ),
                    undefined
                  ),
            y2: oY2Axis.getMinValue() ? oY2Axis.getMinValue() : undefined
          },
          max: {
            x: oXAxis.getMaxValue() ? oXAxis.getMaxValue() : undefined,
            y: oYAxis.getMaxValue()
              ? oYAxis.getMaxValue()
              : oYAxis
                  .getLabels()
                  .reduce(
                    (pre, curr) =>
                      Math.max(
                        pre === undefined ? -Infinity : pre,
                        parseInt(curr.getValue(), 10)
                      ),
                    undefined
                  ),
            y2: oY2Axis.getMaxValue() ? oY2Axis.getMaxValue() : undefined
          }
        })

        // not supported by c3js API, yet
        // this._chart.axis.y.tick.values = oYAxis.getLabels().length > 0 ? oYAxis.getLabels().map(oLabel => parseInt(oLabel.getValue(), 10)) : null;
        // this._chart.axis.y2.tick.values = oY2Axis.getLabels().length > 0 ? oY2Axis.getLabels().map(oLabel => parseInt(oLabel.getValue(), 10)) : null;

        // not supported by c3js API, yet
        // this._chart.grid.x.show = oXAxis.getShowGridLines();
        // this._chart.grid.y.show = oYAxis.getShowGridLines();

        // inform observers about data update
        this.fireChartDataUpdate()
      },

      /**
       * Update chart lines
       *
       * @private
       */
      _updateChartLines() {
        const aOldXLines = [].concat(this._chart.xgrids())
        const aOldYLines = [].concat(this._chart.ygrids())

        const aNewXLines = this.getLines()
          .filter(
            oLine => oLine.getVisible() && oLine.getAxis() === library.Axis.X
          )
          .map(oNewLine => this._mapChartLineToC3Line(oNewLine))

        const aNewYLines = this.getLines()
          .filter(
            oLine => oLine.getVisible() && oLine.getAxis() !== library.Axis.X
          )
          .map(oNewLine => this._mapChartLineToC3Line(oNewLine))

        // update x grid lines
        const aUpdateXList = aNewXLines.filter(oNewLine => {
          const oOldLine = aOldXLines.find(oLine => oLine.id === oNewLine.id)
          // compare old and new line
          return oOldLine && _.isEqual(oNewLine, oOldLine) === false
        })

        // if at least one event changed, we must reset all lines at once
        if (aUpdateXList.length > 0) {
          // OVERRIDE ALL
          // in difference to areas, it is not possible to update existing lines via c3js API
          this._chart.xgrids(aNewXLines)
        } else {
          // only remove and add operations are performed
          // remove x grid lines (attention: complete class list must be provided, not only one unique class)
          aOldXLines
            .filter(oLine =>
              aNewXLines.every(oNewLine => oNewLine.id !== oLine.id)
            )
            .forEach(oLine => {
              this._chart.xgrids.remove({ class: oLine.class })
            })

          // add x grid lines
          const aAddXList = aNewXLines.filter(oNewLine =>
            aOldXLines.every(oLine => oLine.id !== oNewLine.id)
          )
          if (aAddXList.length > 0) {
            this._chart.xgrids.add(aAddXList)
          }
        }

        // update y grid lines
        const aUpdateYList = aNewYLines.filter(oNewLine => {
          const oOldLine = aOldYLines.find(oLine => oLine.id === oNewLine.id)
          // compare old and new line
          return oOldLine && _.isEqual(oNewLine, oOldLine) === false
        })

        // if at least one event changed, we must reset all lines at once
        if (aUpdateYList.length > 0) {
          // OVERRIDE ALL
          // in difference to areas, it is not possible to update existing lines via c3js API
          this._chart.ygrids(aNewYLines)
        } else {
          // only remove and add operations are performed
          // remove y grid lines (attention: complete class list must be provided, not only one unique class)
          aOldYLines
            .filter(oLine =>
              aNewYLines.every(oNewLine => oNewLine.id !== oLine.id)
            )
            .forEach(oLine => {
              this._chart.ygrids.remove({ class: oLine.class })
            })

          // add y grid lines
          const aAddYList = aNewYLines.filter(oNewLine =>
            aOldYLines.every(oLine => oLine.id !== oNewLine.id)
          )
          if (aAddYList.length > 0) {
            this._chart.ygrids.add(aAddYList)
          }
        }

        // update line styles
        this._updateLineStyles()
      },

      /**
       * Update chart areas
       *
       * @private
       */
      _updateChartAreas() {
        const areas = this._chart.regions() || []
        // if only one area exist it may be returned as object and not wrapped in an arry, so we must do this manually
        const aOldAreas = Array.isArray(areas) ? areas : [areas]
        const aNewAreas = this.getAreas()
          .filter(oArea => oArea.getVisible())
          .map(oArea => {
            return {
              id: oArea.getId(),
              start: oArea.getStartValue(),
              end: oArea.getEndValue(),
              axis: oArea.getAxis(),
              text: oArea.getTitle(),
              // position: oArea.getTitlePosition(),
              // add three classes: general line class, line style class and line identifier
              class: `${this.CSS_CLASS_AREA} ${this
                .CSS_CLASS_AREA}-${oArea.getId()}`
            }
          })

        // remove areas (attention: providing a single unique class is sufficient)
        const aRemoveList = aOldAreas
          .filter(oArea =>
            aNewAreas.every(oNewArea => oNewArea.id !== oArea.id)
          )
          .map(oArea => `${this.CSS_CLASS_AREA}-${oArea.id}`) // c3 is expecting a list of classes to remove respective areas
        if (aRemoveList.length > 0) {
          this._chart.regions.remove({ classes: aRemoveList })
        }

        // add areas
        const aAddList = aNewAreas.filter(oNewArea =>
          aOldAreas.every(oArea => oArea.id !== oNewArea.id)
        )
        if (aAddList.length > 0) {
          this._chart.regions.add(aAddList)
        }

        // update areas
        const aUpdateList = aNewAreas.filter(oNewArea => {
          const oOldArea = aOldAreas.find(oArea => oArea.id === oNewArea.id)
          // compare old and new area
          return oOldArea && _.isEqual(oNewArea, oOldArea) === false
        })
        if (aUpdateList.length > 0) {
          this._chart.regions(aUpdateList)
        }

        // update area styles
        this._updateAreaStyles()
      },

      /**
       * Map properties of ChartLine to an object compatible with c3js
       *
       * @param {ui5.viz.ChartLine} [oChartLine] PulseShift chart line.
       * @returns {object} C3js line.
       * @private
       */
      _mapChartLineToC3Line(oChartLine) {
        const sShowSelectorClass = oChartLine.getShowLineSelector()
          ? this.CSS_CLASS_LINE_SHOWSELECTOR
          : ''
        const sIconOnlyClass = oChartLine.getSelectorIconOnly()
          ? this.CSS_CLASS_LINE_ICONONLY
          : ''
        return {
          id: oChartLine.getId(),
          value: oChartLine.getValue(),
          axis: oChartLine.getAxis(),
          text: oChartLine.getTitle(),
          position: oChartLine.getTitlePosition(),
          showSelector: oChartLine.getShowLineSelector() ? true : false,
          // add three classes: general line class, line style class and line identifier
          class: `${this.CSS_CLASS_LINE} ${this
            .CSS_CLASS_LINE}-${oChartLine.getStyle()} ${this
            .CSS_CLASS_LINE}-${oChartLine.getId()} ${sShowSelectorClass} ${sIconOnlyClass}`
        }
      },

      /**
       * Update chart series visibility
       *
       * @private
       */
      _onSeriesVisibilityUpdate(oEvent) {
        let oSeries = oEvent.getParameter('chartSeries')
        if (oSeries.getVisible()) {
          this._chart.show(oSeries.getKey(), { withLegend: true })
        } else {
          this._chart.hide(oSeries.getKey(), { withLegend: true })
        }
      },

      /**
       * Update chart shape area styles
       *
       * @private
       */
      _updateSeriesStyles() {
        // 1. get all series with a chart type that is relevant for shape AREA styles
        this.getSeries().forEach(oSeries => {
          let oPatternStyle,
            sCurrentColor,
            oPattern,
            // set solid style if series type (e.g. bar) is not supporting line styles
            sShapeStyle = this._isShapeType(oSeries.getType())
              ? oSeries.getShapeStyle()
              : library.ShapeStyle.Default

          switch (sShapeStyle) {
            case library.ShapeStyle.Striped:
              // read current color
              sCurrentColor = this._chart.data.colors()[oSeries.getKey()]

              // add pattern to svg definitions
              oPattern = d3.select(
                `#${this.getId()} defs #${this.getId()}-stripe-pattern-${oSeries.getKey()}`
              )
              if (oPattern.empty()) {
                oPattern = d3
                  .select(`#${this.getId()} defs`)
                  .append('pattern')
                  .attr({
                    id: `${this.getId()}-stripe-pattern-${oSeries.getKey()}`,
                    width: '8',
                    height: '8',
                    patternUnits: 'userSpaceOnUse',
                    class: `stripe-pattern-${oSeries.getKey()}`
                  })
                  .append('path')
                  .attr({ d: 'M1,0L5,0L0,5L0,1L1,0 M8,1L8,5L5,8L1,8L8,1' })
              }

              // add css to svg definitions
              oPatternStyle = d3.select(
                `#${this.getId()} defs #${this.getId()}-stripe-style-${oSeries.getKey()}`
              )
              if (oPatternStyle.empty()) {
                oPatternStyle = d3
                  .select(`#${this.getId()} defs`)
                  .append('style')
                  .attr({
                    id: `${this.getId()}-stripe-style-${oSeries.getKey()}`,
                    type: 'text/css'
                  })
              }
              // update svg pattern style
              oPatternStyle.text(
                `#${this.getId()} .stripe-pattern-${oSeries.getKey()} path {
                                    fill: ${sCurrentColor};
                                    stroke: none;
                                }
                                #${this.getId()} .c3-target-${oSeries.getKey()} .c3-shape {
                                    fill: url(#${this.getId()}-stripe-pattern-${oSeries.getKey()}) !important;
                                }`
              )
              break
            case library.ShapeStyle.Default:
            default:
              // remove pattern style from shape area
              oPatternStyle = d3.select(
                `#${this.getId()} defs #${this.getId()}-stripe-style-${oSeries.getKey()}`
              )
              if (!oPatternStyle.empty()) {
                oPatternStyle.text('')
              }
              break
          }
        })

        // 2. get all series with a chart type that is relevant for shape LINE styles
        this.getSeries().forEach(oSeries => {
          let oStrokeStyle,
            sDashArray,
            // set solid style if series type (e.g. bar) is not supporting line styles
            sLineStyle = this._isLineType(oSeries.getType())
              ? oSeries.getLineStyle()
              : library.LineStyle.Default,
            iAnimationSpeed

          // set animation speed
          switch (oSeries.getLineAnimationSpeed()) {
            case library.AnimationSpeed.Fast:
              iAnimationSpeed = 20
              break
            case library.AnimationSpeed.Medium:
              iAnimationSpeed = 50
              break
            case library.AnimationSpeed.Slow:
              iAnimationSpeed = 150
              break
            case library.AnimationSpeed.None:
            default:
              iAnimationSpeed = 0
              break
          }

          switch (sLineStyle) {
            case library.LineStyle.Dashed:
            case library.LineStyle.Dotted:
              // calculate dash array
              sDashArray = oSeries.getLineStyle() === 'dotted' ? '1 5' : '5'

              // add css to svg definitions
              oStrokeStyle = d3.select(
                `#${this.getId()} defs #${this.getId()}-dashdot-style-${oSeries.getKey()}`
              )
              if (oStrokeStyle.empty()) {
                oStrokeStyle = d3
                  .select(`#${this.getId()} defs`)
                  .append('style')
                  .attr({
                    id: `${this.getId()}-dashdot-style-${oSeries.getKey()}`,
                    type: 'text/css'
                  })
              }
              // update svg pattern style
              oStrokeStyle.text(
                `#${this.getId()} .c3-target-${oSeries.getKey()} .c3-shape {
                                    stroke-dashoffset: ${oSeries.getLineAnimationForwards()
                                      ? ''
                                      : '-'}50rem;
                                    stroke-dasharray: ${sDashArray};
                                    stroke-linecap: round;

                                    -webkit-animation: ui5-viz-chart-dash-animation ${iAnimationSpeed}s 0s linear infinite forwards;
                                    -moz-animation: ui5-viz-chart-dash-animation ${iAnimationSpeed}s 0s linear infinite forwards;
                                    -ms-animation: ui5-viz-chart-dash-animation ${iAnimationSpeed}s 0s linear infinite forwards;
                                    -o-animation: ui5-viz-chart-dash-animation ${iAnimationSpeed}s 0s linear infinite forwards;
                                    animation: ui5-viz-chart-dash-animation ${iAnimationSpeed}s 0s linear infinite forwards;
                                }`
              )
              break
            case library.LineStyle.Default:
            default:
              // remove pattern style from shape area
              oStrokeStyle = d3.select(
                `#${this.getId()} defs #${this.getId()}-dashdot-style-${oSeries.getKey()}`
              )
              if (!oStrokeStyle.empty()) {
                oStrokeStyle.text('')
              }
              break
          }
        })
      },

      /**
       * Update chart line styles
       *
       * @private
       */
      _updateLineStyles() {
        let sCSS = '',
          oLineStyle = d3.select(
            `#${this.getId()} defs #${this.getId()}-line-style`
          )

        // create style element if not exist
        if (oLineStyle.empty()) {
          oLineStyle = d3.select(`#${this.getId()} defs`).append('style').attr({
            id: `${this.getId()}-line-style`,
            type: 'text/css'
          })
        }

        // get all chart lines  and concatenate color rules
        this.getLines().forEach(oLine => {
          let sColor = oLine.getColor()

          if (sColor) {
            // update svg area style
            sCSS += `#${this.getId()} .${this
              .CSS_CLASS_LINE}-${oLine.getId()} line {
                                stroke: ${sColor};
                            }

                            #${this.getId()} .${this
              .CSS_CLASS_LINE}-${oLine.getId()} circle {
                                stroke: ${sColor};
                            }

                            #${this.getId()} .${this
              .CSS_CLASS_LINE}-${oLine.getId()} text {
                                fill: ${sColor};
                            }`
          }

          // update line selector icon and selector press event
          let oLineHook = d3.select(
              `#${this.getId()} .ui5-viz-chart-line-${oLine.getId()}`
            ),
            oIconInfo = sap.ui.core.IconPool.getIconInfo(
              oLine.getLineSelectorIcon()
            )

          if (oLine.getShowLineSelector()) {
            // set icon of text element
            oLineHook
              .select('.c3-grid-lines-circle-text')
              .attr('font-family', oIconInfo.fontFamily)
              .text(oIconInfo.content)

            // set click event
            oLineHook
              .select('.c3-grid-lines-circle-hover')
              .on('click', function() {
                oLine.fireSelectorPress({
                  line: oLine,
                  selectorDomRef: this.previousSibling // return circle instead of hover-circle
                })
              })
          } else {
            // unregister click event
            oLineHook
              .select('.c3-grid-lines-circle-hover')
              .on('click', function() {})
          }
        })

        oLineStyle.text(sCSS)
      },

      /**
       * Update chart line areas
       *
       * @private
       */
      _updateAreaStyles() {
        let sCSS = '',
          oAreaStyle = d3.select(
            `#${this.getId()} defs #${this.getId()}-area-style`
          )

        // create style element if not exist
        if (oAreaStyle.empty()) {
          oAreaStyle = d3.select(`#${this.getId()} defs`).append('style').attr({
            id: `${this.getId()}-area-style`,
            type: 'text/css'
          })
        }

        // get all chart areas and concatenate style rules
        this.getAreas().forEach(oArea => {
          let sColor = oArea.getColor() || '#000000',
            sShapeStyle = oArea.getStyle(),
            oPattern

          switch (sShapeStyle) {
            case library.ShapeStyle.Striped:
              // add pattern to svg definitions
              oPattern = d3.select(
                `#${this.getId()} defs #${this.getId()}-area-stripe-pattern-${oArea.getId()}`
              )

              if (oPattern.empty()) {
                oPattern = d3
                  .select(`#${this.getId()} defs`)
                  .append('pattern')
                  .attr({
                    id: `${this.getId()}-area-stripe-pattern-${oArea.getId()}`,
                    width: '8',
                    height: '8',
                    patternUnits: 'userSpaceOnUse',
                    class: `area-stripe-pattern-${oArea.getId()}`
                  })
                  .append('path')
                  .attr({ d: 'M1,0L5,0L0,5L0,1L1,0 M8,1L8,5L5,8L1,8L8,1' })
              }

              // update svg area style
              sCSS += `#${this.getId()} .area-stripe-pattern-${oArea.getId()} path {
                                    fill: ${sColor};
                                    stroke: none;
                                }
                                #${this.getId()} .${this
                .CSS_CLASS_AREA}-${oArea.getId()} rect.c3-region-stripe,
                                #${this.getId()} .${this
                .CSS_CLASS_AREA}-${oArea.getId()} text.c3-region-text {
                                    fill: ${sColor};
                                }
                                #${this.getId()} .${this
                .CSS_CLASS_AREA}-${oArea.getId()} rect.c3-region-area {
                                    fill: url(#${this.getId()}-area-stripe-pattern-${oArea.getId()}) !important;
                                }`
              break

            case library.ShapeStyle.Default:
            default:
              // update svg area style
              sCSS += `#${this.getId()} .${this
                .CSS_CLASS_AREA}-${oArea.getId()} rect.c3-region-stripe,
                                #${this.getId()} .${this
                .CSS_CLASS_AREA}-${oArea.getId()} text.c3-region-text {
                                    fill: ${sColor};
                                }
                                #${this.getId()} .${this
                .CSS_CLASS_AREA}-${oArea.getId()} rect.c3-region-area {
                                    fill: ${sColor};
                                }`
              break
          }
        })

        oAreaStyle.text(sCSS)
      },

      /**
       * Check if a style is valid for shapes
       *
       * @param sSeriesType {string} style to be validated
       * @return {boolean} returns true if style is valid for shape tzpe
       * @private
       */
      _isShapeType(sSeriesType) {
        let bTypeValid = false
        switch (sSeriesType) {
          case library.ChartSeriesType.Bar:
            bTypeValid = true
            break
          default:
            bTypeValid = false
            break
        }
        return bTypeValid
      },

      /**
       * Check if a style is valid for lines
       *
       * @param sSeriesType {string} style to be validated
       * @return {boolean} returns true if style is valid for shape tzpe
       * @private
       */
      _isLineType(sSeriesType) {
        let bTypeValid = false
        switch (sSeriesType) {
          case library.ChartSeriesType.Line:
          case library.ChartSeriesType.Spline:
          case library.ChartSeriesType.Step:
          case library.ChartSeriesType.AreaLine:
          case library.ChartSeriesType.AreaSpline:
          case library.ChartSeriesType.AreaStep:
            bTypeValid = true
            break
          default:
            bTypeValid = false
            break
        }
        return bTypeValid
      },

      /**
       * Get available size in pixel of parent element.
       *
       * @param {string} [sSizeType] size type: 'width' or 'height'
       * @return {number} Returns available size in pixel of parent element
       * @private
       */
      _getAvailableSize(sSizeType) {
        var iMargin = 0

        // fallback to 'width'
        sSizeType =
          sSizeType === 'width' || sSizeType === 'height' ? sSizeType : 'width'

        // get margin
        if (this.getDomRef()) {
          if (sSizeType === 'width') {
            iMargin += parseInt(
              getComputedStyle(this.getDomRef(), '').marginLeft.match(
                /(\d*(\.\d*)?)/,
                10
              )[1]
            )
            iMargin += parseInt(
              getComputedStyle(this.getDomRef(), '').marginRight.match(
                /(\d*(\.\d*)?)/,
                10
              )[1]
            )
          } else {
            iMargin += parseInt(
              getComputedStyle(this.getDomRef(), '').marginTop.match(
                /(\d*(\.\d*)?)/,
                10
              )[1]
            )
            iMargin += parseInt(
              getComputedStyle(this.getDomRef(), '').marginBottom.match(
                /(\d*(\.\d*)?)/,
                10
              )[1]
            )
          }
        }

        // get available width of parent element
        return $(this._getParentDomRef())[sSizeType]() - iMargin
      },

      /**
       * Get computed CSS size in pixel.
       *
       * @param {sap.ui.core.CSSSize} [sCSSSize] Expects a sap.ui.core.CSSSize element
       * @param {string} [sSizeType] Size type: 'width' or 'height'
       * @return {number} Returns computed size in pixel based on CSS size
       * @private
       */
      _getComputedSize(sCSSSize, sSizeType) {
        sCSSSize = sCSSSize || 'auto'
        sSizeType =
          sSizeType === 'width' || sSizeType === 'height' ? sSizeType : 'width'

        // parse css value
        var mCSS = library.parseCSSSize(sCSSSize),
          iFraction = 1,
          iCalculatedWidth

        switch (mCSS.unit) {
          case 'rem':
            // calculate pixel dependant on font size of root element
            iCalculatedWidth = parseInt(
              getComputedStyle(document.body, '').fontSize.match(
                /(\d*(\.\d*)?)/,
                10
              )[1]
            )
            break
          case 'em':
            // calculate pixel dependant on font size of parent
            iCalculatedWidth = parseInt(
              getComputedStyle(this._getParentDomRef(), '').fontSize.match(
                /(\d*(\.\d*)?)/,
                10
              )[1]
            )
            break
          case 'px':
            // if width value is negative or not supposed, then we take the full browser width
            iCalculatedWidth =
              mCSS.value && mCSS.value > 0
                ? mCSS.value
                : this._getAvailableSize(sSizeType)
            break
          case 'vw':
            // percentage value of viewport width
            iFraction = (mCSS.value && mCSS.value > 0 ? mCSS.value : 100) / 100
            iCalculatedWidth = this._getAvailableSize('width') * iFraction
            break
          case 'vh':
            // percentage value of viewport height
            iFraction = (mCSS.value && mCSS.value > 0 ? mCSS.value : 100) / 100
            iCalculatedWidth = this._getAvailableSize('height') * iFraction
            break
          case '%':
            // transform css value to fraction (50% >> 0.5)
            iFraction = (mCSS.value && mCSS.value > 0 ? mCSS.value : 100) / 100
            iCalculatedWidth = this._getAvailableSize(sSizeType) * iFraction
            break
          // continue with 'auto:'
          case 'initial':
          // continue with 'auto:'
          case 'inherit':
          // continue with 'auto:'
          case 'auto':
            // continue with 'auto:'
            iCalculatedWidth = this._getAvailableSize(sSizeType)
            break
          default:
            // not supported, yet: ch, ex, vmin, vmax, cm, mm, in, pc, pt, mozmm
            // check: https://developer.mozilla.org/de/docs/Web/CSS/length#Interpolation
            jQuery.sap.log.warning(
              'CSS unit ' +
                mCSS.unit +
                ' is not supported, yet. Fallback to "auto" (max. width).'
            )
            iCalculatedWidth = this._getAvailableSize(sSizeType)
            break
        }

        return iCalculatedWidth
      },

      /**
       * Resize chart and update width and height.
       *
       * @return {ui5.viz.Chart} <code>this</code> to allow method chaining
       * @private
       */
      _resize() {
        if (this._chart) {
          this._chart.resize({
            width: this.getWidth(),
            height: this.getHeigth()
          })
        }
        return this
      },

      /**
       * Get parent DOM element of chart control.
       *
       * @return {DOM} Returns parent DOM element of chart control
       * @private
       */
      _getParentDomRef() {
        // try to return parent DOM element, else return document.body
        var oParentNode = this.getDomRef()
          ? this.getDomRef().parentNode
          : document.body
        return oParentNode ? oParentNode : document.body
      }
    })
  },
  /* bExport= */ true
)
