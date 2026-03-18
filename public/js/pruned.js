$(document).ready(function () {

        $('#MAINGRAPHPRUNED').highcharts('StockChart', {

            chart: {
                zoomType: 'x'
            },
            loading: {
                style: {
                    backgroundColor: 'silver'
                },
                labelStyle: {
                    color: 'black'
                }
            },
            navigator: {
                adaptToUpdatedData: true
            },
            scrollbar: {
                liveRedraw: false
            },
            title: {
                text: 'Oxygen Levels'
            },
            xAxis: {
                type: 'datetime'

           //,  crosshair: false

            },


            yAxis: [{
                          labels: {
                            align: 'right',
                            x: -4
                          },
                          title: {
                              text: 'SpO2 & bpm'
                          }
                      }, {
                          labels: {
                            align: 'left',
                            x: 8
                          },
                          title: {
                              text: 'P.I.'
                          },
                          top: '75%',
                          height: '25%',
                          offset: 0
                      }

                    ],

            legend: {
                enabled: true
            },
            plotOptions: {
                line: {
                    connectNulls: false
                },
                columnrange: {
                    pointPadding: -0.25,
                    minPointLength: 5,
                    dataGrouping: {
                        groupPixelWidth: 50
                    //  ,  approximation: 'average'
                    }
                  }
            },




            tooltip: {
                valueDecimals: 2
              //,  split: true
            },
            rangeSelector: {
                buttons: [
                    {
                        type: 'minute',
                        count: 1,
                        text: '1M'
                    },
                    {
                        type: 'minute',
                        count: 10,
                        text: '10M'
                    },
                    {
                        type: 'hour',
                        count: 1,
                        text: '1H'
                    },
                    {
                        type: 'all',
                        text: 'All'
                    }
                ],
                selected: 3,
                inputEnabled: true
            },

            series: [
                {
                    type: 'columnrange',
                    name: 'O2%',
          //          data: data.spo2,
                    turboThreshold: 0,
                    pointPlacement: "between"
                },
                {
                    type: 'spline',
                    name: 'O2%',
                    id: 'spo2',
          ///          data: data.spo2,
                    turboThreshold: 0,
                    pointPlacement: "between"
                },
                {
                    type: 'scatter',
                    name: 'Alarm',
                    color: "rgba(178,34,34,0.5)",
                    fillColor: 'rgba(178,34,34,0.5)',
          ///          data: data.alarms,
                    onSeries: 'spo2',
                    turboThreshold: 0,
                    showInLegend: true
                    // tooltip: {
                    //     headerFormat: '<b>{series.name}</b><br>',
                    //     pointFormat: ('{point.y} O2%</br>{point.bpm} BPM</br>{point.pi} PI')
                    // },
                    // dataGrouping: {
                    //     forced: true,
                    //     smoothed: false
                    // }
                },
                {
                    type: 'spline',
                    name: 'BPM',
                    id: 'bpm',
            ///        data: data.bpm,
                    turboThreshold: 0,
                    pointPlacement: "between",
                    visible: true
                }
                ,
                {
                    type: 'spline',
                    yAxis: 1,
                    name: 'PI',
                    id: 'pi',
              ///      data: data.pi,
                    turboThreshold: 0,
                    pointPlacement: "between",
                    visible: false,
                    negativeColor: '#FF0000' ,
                    threshold: 1
                }
              ]
        });
      load_last_avail_day()



});

var ms = new Object();     /// day on display

function load_last_avail_day() {
  // call server to get the last avalaible day in the ddbb

  $.getJSON('/data', function (data) {
          var row = data[0];
          lastDate= new Date(row.date);

          lastDate.setTime(lastDate- 17*60*60*1000);
          lastDate.setHours(19);
          lastDate.setMinutes(0);
          lastDate.setSeconds(0);
          lastDate.setMilliseconds(0);

          ms_start=lastDate.getTime();
          ms_end=ms_start+ 22*60*60*1000 ;
          ms.start=ms_start;
          ms.end=ms_end;
          load_day();
      });
};


function prev_day(){
  ms.start=ms.start-24*60*60*1000;
  ms.end=ms.end-24*60*60*1000;
  load_day();
  };
function next_day(){
  ms.start=ms.start+24*60*60*1000;
  ms.end=ms.end+24*60*60*1000;
  load_day();
  };
function prev_week(){
  ms.start=ms.start-24*60*60*1000*7;
  ms.end=ms.end-24*60*60*1000*7;
  load_day();
  };
function next_week(){
  ms.start=ms.start+24*60*60*1000*7;
  ms.end=ms.end+24*60*60*1000*7;
  load_day();
  };
function day_1(){
  dt_start = new Date(Date.UTC(2017, 1- 1, 31,19, 0, 0, 0));
  ms.start=dt_start.getTime();
  ms.end=ms.start+ 17*60*60*1000 ;
  load_day();
  };
function day_2(){
  dt_start = new Date(Date.UTC(2017, 2 - 1, 4,19, 0, 0, 0));
  ms.start=dt_start.getTime();
  ms.end=ms.start+ 17*60*60*1000 ;
  load_day();
  };
function load_day() {
  var chart = $('#MAINGRAPHPRUNED').highcharts();
    chart.showLoading('Loading data from server...');

    $.getJSON('/SPO2data?start=' + Math.round(ms.start) +
        '&end=' + Math.round(ms.end), function (data)  {
           chart.series[0].setData(data.spo2,false);
          // 20181109 chart.series[0].setData([data.spo2.x,data.spo2.y,data.spo2.y],false);
          //objArray.map(a => a.foo)
            chart.series[1].setData(data.spo2.map(a => [ a.x, a.low]),false);
          //  chart.series[1].setData(data.spo2,false);
            chart.series[2].setData(data.alarms,false);
            chart.series[3].setData(data.bpm,false);
            chart.series[4].setData(data.pi,false);

            chart.redraw();


            chart.hideLoading();
            chart.rangeSelector.clickButton(3, true);

        });
}

function load_bars() {

}

function group_spo2 (start,end, spo2data) {
// TODO?? look up start index in array +exit


//spo2.count=new Array(101).fill(0);
spo2count=[];

for(var i = 0; i< spo2data.x.length; i++) {
  if (start <=spo2data.x && spo2data.x<=end) {
    var val = spo2data.value[i];
    spo2count[val]= spo2count[val] ? spo2count[val] + 1 : 1;
    //spo2count[spo2data.value[i]]++;
  }
}
var total = 0;



for(var i = 0; i< spo2count.length; i++) {
  total= total + (spo2count[i] ? spo2count[i] : 0)
}

  var results = [];
for(var i = 0; i< spo2count.length; i++) {

  if (spo2count[i]) {
    results.push({
        value : i,
        pct : spo2count[i] /total *100,
        count :  spo2count[i]
    })

  }

}
  return result;
}
