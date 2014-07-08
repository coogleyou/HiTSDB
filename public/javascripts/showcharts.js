/**
 * Created by Lxy on 14-6-8.
 */

//获取时间戳  GetTime("2013-02-03 10:10:10")
function GetTime(time){
    re = /(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?/.exec(time);
    return Math.floor(new Date(re[1],(re[2]||1)-1,re[3]||1,re[4]||0,re[5]||0,re[6]||0).getTime()/1000);
}

function getOptions(){
    return {
        chart: {
            //renderTo: 'container',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: '',
            x: -20
        },
        subtitle: {
            text: '',
            x: -20
        },
        xAxis: {
            labels: {
                rotation: 0
            },
            dateTimeLabelFormats: {
                second: '%Y-%m-%d<br/>%H:%M:%S',
                minute: '%Y-%m-%d<br/>%H:%M',
                hour: '%Y-%m-%d<br/>%H:%M',
                day: '%Y<br/>%m-%d',
                week: '%Y<br/>%m-%d',
                month: '%Y-%m',
                year: '%Y'
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            opposite: false,
            lineWidth: 2
        },
        tooltip: {
            useHTML: true,
            dateTimeLabelFormats: {
                //millisecond: "%A, %b %e, %H:%M:%S.%L",
                second: "%A, %m-%d, %H:%M:%S",
                minute: "%A, %m-%d, %H:%M",
                hour: "%A, %m-%d, %H:%M",
                day: "%A, %Y-%m-%d",
                week: "%A, %Y-%m-%d",
                month: "%Y-%m",
                year: "%Y"
            },
            xDateFormat: "%A, %Y-%m-%d, %H:%M"
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 1
        },
        plotOptions: {
            series: {
                lineWidth: 1,
                marker: {
                    radius: 3,
                    lineWidth: 0
                },
                point: {
                    events: {
                        'click': function() {
                        }
                    }
                }
            }
        },
        series: []
    };
}

function getStockOptions(){
    var options = getOptions();
    options['rangeSelector'] = {
        buttons: [{
            type: 'hour',
            count: 12,
            text: '12h'
        }, {
            type: 'day',
            count: 2,
            text: '2d'
        }, {
            type: 'month',
            count: 1,
            text: '1m'
        }, {
            type: 'year',
            count: 1,
            text: '1y'
        }, {
            type: 'all',
            text: 'All'
        }],
        inputEnabled: false, // it supports only days
        selected : 4 // all
    };
    return options;
}

$(function(){
    Highcharts.setOptions({
        global: {
            useUTC: false
        },
//        colors: ['#ff7f50','#87cefa','#da70d6','#32cd32','#6495ed',
//            '#ff69b4','#ba55d3','#cd5c5c','#ffa500','#40e0d0',
//            '#1e90ff','#ff6347','#7b68ee','#00fa9a','#ffd700',
//            '#6699FF','#ff6666','#3cb371','#b8860b','#30e0e0'],
        colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        lang: {
            printChart: "打印",
            downloadJPEG: "保存为JPEG图片",
            downloadPDF: "保存为PDF",
            downloadSVG: "保存为SVG文件",
            downloadPNG: "保存为PNG文件",
            drillUpText: "返回 {series.name}",
            resetZoom: "重置",
            resetZoomTitle: "重置缩放比例1:1",
            weekdays: ["日", "一", "二", "三", "四", "五", "六"]
        },
        credits: {
            enabled: false
        },
        tooltip: {
            //shared: true,
            dateTimeLabelFormats: {
                //millisecond: "%A, %b %e, %H:%M:%S.%L",
                second: "%A, %m-%e, %H:%M:%S",
                minute: "%A, %m-%e, %H:%M",
                hour: "%A, %m-%e, %H:%M",
                day: "%A, %Y-%m-%e",
                week: "%A, %Y-%m-%e",
                month: "%Y-%m",
                year: "%Y"
            }
        }

    });


    $(".query_chart_p").click(function(){
        var querydata = {};
        querydata.metric = $(this).attr('metric');
        var timespan = 'year';
        querydata.timespan = timespan;
        if($(".start_time") && $(".start_time").value){
            querydata.start = GetTime($(".start_time").value);
        }else {
            querydata.start = GetTime(new Date().getUTCFullYear());
        }
        $.ajax({
            url : "/query",
            type : "POST",
            cache : false,
            dataType : "json",
            data : querydata,
            error : function(jqXHR, textStatus, errorThrown) {
                alert('error ' + textStatus + " " + errorThrown);
            },
            success : function(data) {
                if (typeof (data) == "object") {
                    alert(data.message);
                }
                else {
                    var data = $.parseJSON(data);
                    var options = getOptions();
                    options.title.text = data.title;
                    options.xAxis.categories = data.categories;
                    options.series = data.series;
                    charts = new Highcharts.Chart(options);
                }
            }
        });
    });
    var path = location.pathname.split('/')[1];
    $("a[href='/"+path+"']").parent().addClass('active');
});