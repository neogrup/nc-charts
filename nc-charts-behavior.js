import * as async from '@polymer/polymer/lib/utils/async.js'
import moment from 'moment/src/moment.js';
import 'moment/src/locale/es.js';
import "jquery/dist/jquery.js";
import 'highcharts';

import 'highcharts/modules/heatmap.js';
import 'highcharts/modules/exporting';
import 'highcharts/modules/drilldown.js';
import 'highcharts/modules/boost'
import 'highcharts/highcharts-more';

Highcharts.setOptions({global: {useUTC: false}})
const _extends = (...a) => Object.assign({}, ...a)

export const HighchartsPolymer = {
    Highcharts,
    /* @polymerMixin */
    BaseBehavior: superClass => {
        const newObj = _ => ({}), newArr = _ => []
        return class extends superClass {
            constructor() {
                super()
                this.__lateBindCallbacks = _extends({}, this.__lateBindCallbacks, {_updateType:1,_loadingUpdate:1})
            }
            static get properties() {return {
                type: {type: String, observer: "_updateType"},
                mode: {type: String},
                title: {type: String, value: "", observer: "_titleUpdate"},
                subtitle: {type: String, observer: "_subtitleUpdate"},
                colorByPoint: {type: Boolean, value: false, reflectToAttribute:true, observer: "_cbpUpdate"},
                monochromatic: {type: Boolean, value: false, reflectToAttribute:true}, // NC
                color: {type: String, value: false, reflectToAttribute:true}, // NC
                colorAxis: {type: Object, value: function(){return {}}, reflectToAttribute:true}, // NC
                credits: {type: Boolean, value: false, reflectToAttribute:true, observer: "_creditsUpdate"},
                legend: {type: Boolean, value: false, reflectToAttribute:true, observer: "_legendUpdate"},
                chartOptions: {type: Object, value: newObj, observer: "_chartUpdate"},
                plotOptions: {type: Object, value: newObj, observer: "_plotUpdate"},
                xAxis: {type: Object, value: newObj, observer: "_xAxisUpdate"},
                xAxisCategories: {type: Object, value: newObj, observer: "_xAxisCategoriesUpdate"}, // NC
                yAxis: {type: Object, value: newObj, observer: "_yAxisUpdate"},
                yAxisCategories: {type: Object, value: newObj, observer: "_yAxisCategoriesUpdate"}, // NC
                xLabel: {type: String, value: "", observer: "_xAxisTitleUpdate"},
                yLabel: {type: String, value: "", observer: "_yAxisTitleUpdate"},
                label: {type: String, value: "", observer: "_labelUpdate"},
                data: {type: Array, value: newArr, observer:"_dataUpdate"},
                export: {type: Boolean, value: false, reflectToAttribute: true, observer: "_exportingUpdate"},
                xZoom: {type: Boolean, value: false, reflectToAttribute: true, observer: "_zoomUpdate"},
                yZoom: {type: Boolean, value: false, reflectToAttribute: true, observer: "_zoomUpdate"},
                loading: {type: Boolean, value: false, observer: "_loadingUpdate", reflectToAttribute:true},
                loadingMessage: {type: String, value: ""},
                renderer: {type: Object, computed: "_getRenderer(_chart.renderer)"},
                //Custom Chart Declarations
                legendOptions: {type: Object, value: newObj, observer: "_legendOptionsUpdate"},
                tooltipOptions: {type: Object, value: newObj, observer: "_tooltipOptionsUpdate"},
                highchartOptions: {type: Object, value: newObj, observer: "_hcUpdate"},
                _chart: {type: Object, readOnly: true},
                __microTaskDelaySetData: {type: Number, value: 25},
            }}
            __createChart(namespace) {
                var xAxis = _extends(this.vsTime?{type: 'datetime',tickPixelInterval: 150}:{},this.xAxis, {title: {text: this._getAxisLabel('X')}});
                var yAxis = _extends(this.yAxis, {title: {text: this._getAxisLabel('Y')}});
                var Series = this.data.length && this.data[0].data instanceof Array?this.data:[{name: (this.label||this.yLabel||this.xLabel),colorByPoint: this.colorByPoint, data: this.data}];
                var __app = this;

                // Custom plot options for NC charts
                switch (this.mode) {
                  case "statsFamiliesSales":
                  case "statsFamiliesEvolSales":
                  case "statsGroupsSales":
                  case "statsGroupsEvolSales":
                  case "statsSourcesSales":
                  case "statsZonesSales":
                    this.plotOptions = {
                      pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        showInLegend: false,
                        dataLabels: {
                          enabled: true,
                          format: '{point.name}',
                          style: {
                            'color': '#424242',
                            'fontSize': '12px',
                            'fontFamily': 'Roboto',
                            'fontWeight': 'normal'
                          }
                        },
                        tooltip: {
                          'headerFormat': '{point.key}<br>',
                          'pointFormat': '<b>{point.y} €</b> ({point.percentage:.1f}%)'
                        }
  
                      }
                    }
                    break;
  
                  case "statsHoursSales":
                    this.xAxis.type = "category";
                    this.plotOptions = {
                      column: {
                        color: this.color,
                        groupPadding: 0.01,
                        tooltip: {
                          'headerFormat': '{point.key}<br>',
                          'pointFormat': '<b>{point.y} €</b>'
                        }
                      }
                    }
                    break;
                  case "statsHoursCount":
                    this.xAxis.type = "category";
                    this.plotOptions = {
                      column: {
                        color: this.color,
                        groupPadding: 0.01,
                        tooltip: {
                          'headerFormat': '{point.key}<br>',
                          'pointFormat': '<b>{point.y}</b>'
                        }
                      }
                    }
                    break;
  
                  case "statsPayments":
                    this.xAxis.type = "category";
                    this.plotOptions = {
                      bar: {
                        color: this.color,
                        groupPadding: 0.01,
                        tooltip: {
                          'headerFormat': '{point.key}<br>',
                          'pointFormat': '<b>{point.y} €</b>'
                        }
                      }
                    }
                    break;
  
                  case "statsWeekSales":
                    this.tooltipOptions = {
                      _shared: true
                    }
                    this.xAxis.type = "category";
                    this.plotOptions = {
                      column: {
                        tooltip: {
                          'headerFormat': '{point.key}<br>',
                          'pointFormat': '{series.name}: <b>{point.y} €</b>'
                        }
                      }
                    }
                    break;
  
                  case "statsMonthSales":
                    this.tooltipOptions = {
                      shared: true
                    }
                    this.xAxis.type = "category";
                    this.plotOptions = {
                      spline: {
                        marker: {
                          enabled: false
                        },
                        tooltip: {
                          'headerFormat': '{point.key}<br>',
                          'pointFormat': '{series.name}: <b>{point.y} €</b><br>'
                        },
                      }
                    }
                    break;
  
                  case "statsHoursWeekSales":
                    this.plotOptions = {
                      heatmap: {
                        borderWidth: 1,
                        borderColor: '#FFFFFF',
                      }
                    }
                    break;
  
                  case "statsMonthSales":
                    this.tooltipOptions = {
                      shared: true
                    };
                    this.xAxis.type = "category";
                    this.plotOptions = {
                      spline: {
                        marker: {
                          enabled: false
                        },
                        tooltip: {
                          'headerFormat': '{point.key}<br>',
                          'pointFormat': '{series.name}: <b>{point.y} €</b><br>'
                        }
                      }
                    };
                    break;
  
                  case "statsMonthSalesDOW":
                    this.tooltipOptions = {
                      shared: true
                    };
                    this.xAxis.type = "category";
                    this.plotOptions = {
                      spline: {
                        marker: {
                          enabled: false
                        },
                        tooltip: {
                          // 'headerFormat': moment('{point.key}').format(),
                          'headerFormat': moment('20180510').format('L') + '<br>',
                          // 'headerFormat': '{point.key}<br>',
                          'pointFormat': '{series.name}: <b>{point.y} €</b><br>'
                        }
                      }
                    };
                    break;
  
                  case "statsHoursWeekSales":
                  case "statsHoursWeekSalesAverage":
                  case "statsMonthYearSales":
                    this.plotOptions = {
                      heatmap: {
                        borderWidth: 1,
                        borderColor: '#FFFFFF'
                      }
                    };
                    break;
  
                  case "statsHistogramPrice":
                    this.xAxis.type = "category";
                    this.plotOptions = {
                      column: {
                        color: this.color,
                        groupPadding: 0.01,
                        tooltip: {
                          'headerFormat': '{point.key} €<br>',
                          'pointFormat': '<b>{point.y} tickets</b>'
                        }
                      }
                    };
                    break;
                }

                this._set_chart(new Highcharts[namespace||"Chart"](_extends(true,{},{
                    chart: _extends({
                        renderTo: __app.$.Chart,
                        defaultSeriesType: this.type,
                        // animation: Highcharts.svg, // don't animate in old IE
                        animation: false,
                        marginRight: 10,
                        events: {
                            click: function(e){__app._fire("chart-click",{e: e,chart: this,component:__app})},
                            load: function(e){__app._fire("chart-load",{e: e,chart: this,component:__app})},
                            beforePrint: function(e){__app._fire("before-print",{e: e,chart: this,component:__app})},
                            afterPrint: function(e){__app._fire("after-print",{e: e,chart: this,component:__app})},
                            addSeries: function(e){__app._fire("series-added",{e: e,chart: this,component:__app})},
                            drilldown: function(e){__app._fire("drill-down",{e: e,chart: this,component:__app})},
                            drillup: function(e){__app._fire("drill-up",{e: e,chart: this,component:__app})},
                            drillupall: function(e){__app._fire("drill-up-all",{e: e,chart: this,component:__app})},
                            selection: function(e){__app._fire("selection",{e: e,chart: this,component:__app})},
                            redraw: function(e){__app._fire("redraw",{e: e,chart: this,component:__app})},
                            render: function(e){__app._fire("render",{e: e,chart: this,component:__app})},
                        }
                    },this.xZoom||this.yZoom?{zoomType: (this.xZoom&&"x")+(this.yZoom&&"y")}:{},this.chartOptions),
                    //Properties
                    title: {
                      align: 'left',
                      text: this.title,
                      style: {
                        'color': '#424242',
                        'fontSize': '16px',
                        'fontFamily': 'Roboto',
                        'fontWeight': 'bolder'
  
                      },
                    }, // NC
                    subtitle: {text: this.subtitle},
                    xAxis: xAxis,
                    yAxis: yAxis,
                    colorAxis:(Object.keys(this.colorAxis).length === 0 && this.colorAxis.constructor === Object)? null:this.colorAxis, // NC
                    credits: {enabled: this.credits},
                    plotOptions: _extends({
                      series: {
                        animation: false
                      }, // NC
                      pie: {
                          allowPointSelect: true,
                          cursor: 'pointer',
                          dataLabels: {
                              enabled: true,
                              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                              style: {color: (Highcharts.theme||[]).contrastTextColor||'black'},
                          }
                      }
                    }, this.plotOptions),
                    // tooltip: _extends(this.vsTime?{formatter: function(_) { 
                    //     return [
                    //         `<b>${this.points ? this.points[0].series.name : this.series.name}</b>`,
                    //         Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x),
                    //         Highcharts.numberFormat(this.y, 2),
                    //     ].join('<br>')
                    // }}:{},this.tooltipOptions),
                    tooltip: $.extend(this.mode == "statsHoursWeekSales" || this.mode == "statsHoursWeekSalesAverage" || this.mode == "statsMonthYearSales" ? {
                      formatter: function formatter() {
                        return this.series.xAxis.categories[this.point.x] + '<br>' + this.series.yAxis.categories[this.point.y] + '<br><b>' + this.point.value + ' €</b>';
                      }
                    } : this.mode == "statsMonthSalesDOW" ? {
                      formatter: function formatter() {
                        var result = moment(this.points[0].key).format('L') + ' ' + moment(this.points[0].key).format('ddd');
                        this.points.forEach(function (element) {
                          result = result + "<br>" + element.series.name + ': <b>' + element.y + ' €</b>'; // console.log(element)
                        });
                        return result;
                      }
                    } : {}, this.tooltipOptions), // NC
                    legend: _extends({enabled: this.legend},this.legendOptions),
                    exporting: {enabled: this.export},
                    series: Series,
                    drilldown: {series: []}
                },this.highchartOptions)))
                setTimeout(_ => this.resizeChart(), 50)
                setTimeout(_ => this.__lateBinders(), 50)

                if (this.monochromatic) { // NC
                  this._chart.options.plotOptions.pie.colors = (function () {
                    let colors = [],
                      base = '#058DC7', //Highcharts.getOptions().colors[0],
                      i;
                    for (i = 0; i < 10; i += 1) {
                      // Start out with a darkened base color (negative brighten), and end
                      // up with a much brighter color
                      colors.push(Highcharts.Color(base).brighten((i - 1) / 7).get());
                    }
                    return colors;
                  }());
                }
                this._chart.xAxis[0].update(this.xAxis);
            }
            setData(x,z) {
                const __app = this, isArr = x instanceof Array
                if (!isArr) {x = _extends({name: (this.label||this.yLabel||this.xLabel),colorByPoint: this.colorByPoint},x)}

                if ((this.mode == "statsHoursCount") ){ //|| (this.mode == "statsHoursSales")
                  if (typeof this.xAxisCategories.categories=="undefined") {
                    this.xAxisCategories.categories = [];
                    x.forEach(d => this.xAxisCategories.categories.push(d[0]) );
                  }
                }

                if (x && x.length && x[0].data instanceof Array) {
                    async.microTask.run(_ => {
                        while (__app._chart.series.length) {
                            __app.removeSeries(0,false)
                        }
                        x.forEach(d => __app._chart.addSeries(d))
                    }, __app.__microTaskDelaySetData); 
                } else {__app._getSeries(z)[isArr?"setData":"update"](x)}
            }
            addData(x,y,z,drillable) {this.pushData(x,y,z,true,drillable)}
            pushData(x,y,z,append,drillable) {
                if (typeof z=="boolean") {drillable = z;z=0}
                this._getSeries(z).addPoint(drillable?{name:x,y:y,drilldown:true}:[x,y],true,!append)
            }
            addSeries(name,data,colorByPoint,otherOptions) {this._chart.addSeries(_extends({name: name, data: (data||[]), colorByPoint: typeof colorByPoint=="undefined"?this.colorByPoint:colorByPoint},typeof otherOptions == "object"?otherOptions:{}),true)}
            addDrillSeries(point,data,name) {this._chart.addSeriesAsDrilldown(point, {name: name, data: data})}
            removeSeries(z,redraw) {const s = this._getSeries(z);s.remove(redraw);return s}
            updateSeries(k,v,z) {let NewEl = {};if(typeof k=="object"){NewEl = k;z=v||z}else{NewEl[k]=v};this._getSeries(z).update(NewEl)}
            resizeChart() {if(!this._chart){return}this._chart.reflow()}
            resizeChartFixed() {if(!this._chart){return}this._chart.setSize(this.$.Chart.offsetWidth,this.offsetHeight)}
            reRender() {if(!this._chart){return}this._set_chart(new Highcharts.Chart(this._chart.options));this.setData(this.data);this.__lateBinders()}
            downloadAs(name,otherOptions) {if(!this._chart){return}this._chart.exportChart(_extends({filename: name},otherOptions))}
            destroy() {if(!this._chart){return}this._chart.destroy()}
            showLoading(d) {this.loadingMessage=d;this.loading=true}
            zoomOut() {if(!this._chart){return};this._chart.zoomOut()}
            getSeries(z) {return this._getSeries(z)}
            _getSeries(z) {if(!this._chart){return this._returnDummySeries()};z=typeof z != "number"?0:z;const s=this._chart.series;if(!s.length){this._warn("Chart is empty [no series]");return this._returnDummySeries()};if (z<s.length){return s[(z||0)]}else{this._warn("Index z out of bounds");return this._returnDummySeries()}}
            _dataUpdate(d) {this.setData(d.slice?d.slice(0):d)}
            _warn(err,c) {console.warn("%c[highcharts-chart"+(c?"::"+c:'')+"]","font-weight:bold;background-color:yellow",err)}
            _creditsUpdate(c) {if(!this._chart){return};this._chart.update({credits: {enabled: c}})}
            _legendUpdate(s) {if(!this._chart){return};this._chart.legend.update({enabled: s})}
            _legendOptionsUpdate(o) {if(!this._chart){return};this._chart.legend.update(o)}
            _tooltipOptionsUpdate(o) {if(!this._chart){return};this._chart.tooltip.update(o)}
            _plotUpdate(o) {if(!this._chart){return};this._chart.update({plotOptions: o})}
            _chartUpdate(o) {if(!this._chart){return};Object.keys(o||{}).length && this._warn("Not doing what you wanted, maybe you meant plotOptions?","chartOptions");this._chart.update({chart: o})}
            _exportingUpdate(x) {if(!this._chart){return};this._chart.update({exporting: {enabled: x}})}
            _updateType() {if(!this.type){return};this.updateSeries("type",this.type);this._xAxisCategoriesUpdate();this._yAxisCategoriesUpdate();}
            _cbpUpdate() {this.updateSeries("colorByPoint",this.colorByPoint)}
            _xAxisUpdate() {if(!this._chart){return};this._chart.xAxis[0].update(this.xAxis)}
            _xAxisCategoriesUpdate() {if(!this._chart){return};this._chart.xAxis[0].update({categories: this.xAxisCategories.categories})}
            _yAxisUpdate() {if(!this._chart){return};this._chart.yAxis[0].update(this.yAxis)}
            _yAxisCategoriesUpdate() {if(!this._chart){return};this._chart.yAxis[0].update({categories: this.yAxisCategories.categories})}
            _zoomUpdate() {if(!this._chart){return};this._chart.update({chart: {zoomType: ""+(this.xZoom?"x":'')+(this.yZoom?"y":'')}})}
            _xAxisTitleUpdate() {if(!this._chart){return};this._chart.xAxis[0].update({title: {text: this._getAxisLabel('X')}})}
            _yAxisTitleUpdate() {if(!this._chart){return};this._chart.yAxis[0].update({title: {text: this._getAxisLabel('Y')}})}
            _labelUpdate() {if(!this._chart){return};this._xAxisTitleUpdate();this._yAxisTitleUpdate()}
            _titleUpdate() {if(!this._chart){return};this._chart.setTitle({text: this.title})}
            _loadingUpdate() {if(!this._chart){return};this._chart[(this.loading?"show":"hide")+"Loading"](this.loadingMessage)}
            _subtitleUpdate() {if(!this._chart){return};this._chart.setTitle(null,{text: this.subtitle})}
            _hcUpdate(o) {if(!this._chart){return};this._chart.update(o)}
            _getRenderer() {if(!this._chart){return};return this._chart.renderer}
            //Other Bindings
            _getAxisLabel(dim) {let l = dim.toLowerCase(),u = dim.toUpperCase(),lab = this[l+"Label"]||this.label;if(lab==u+"-Axis"){lab=this.label||lab};return lab.trim()}
            _returnDummySeries(){const f=function(){};return {isDummy: true, setData: f, addPoint: f, update: f,remove: f}}
            __lateBinders(){const me = this;Object.keys(this.__lateBindCallbacks||{}).forEach(function(cb){me[cb]()})}
            __addLateBinder(cb){if (!(cb instanceof Array)){cb = [cb]};if(!this.__lateBindCallbacks){this.__lateBindCallbacks={}};const me = this;cb.forEach(function(c){me.__lateBindCallbacks[c]=1})}
            /* Need to define a local fire method here as it is not present in Polymer 2 */
            _fire(eventName, detail) {this.dispatchEvent(new CustomEvent(eventName, {bubbles: true,composed: true, detail: detail}))}
        }
    },
    /* @polymerMixin */
    ChartBehavior: superClass => {
        return class extends superClass {
            constructor() {super();this.__addLateBinder("_vsTimeUpdate")}
            static get properties() {return {
                vsTime: {type: Boolean, value: false, reflectToAttribute: true, observer: "_vsTimeUpdate"},
                selected: {type: Boolean, value: false, readOnly: true, notify: true, reflectToAttribute: true},
                selectedPoints: {type: Array, readOnly: true, notify: true},
            }}

            _vsTimeUpdate(a) {if(!this._chart || typeof a == "undefined"){return};this.destroy();this.ready()}
            _checkSelected() {if(!this._chart){return};var points = this._chart.getSelectedPoints();this._setSelected(!!points.length);this._setSelectedPoints(points)}
        }
    }
}