$(function () {
    getMorris('line', 'line_chart');
});


function getMorris(type, element, evoData) {
    if (type === 'line') {
        Morris.Line({
            element: element,
            data: [{
                    'period': '2011 Q3',
                    'licensed': 3407,
                    'sorned': 660
                }, {
                    'period': '2011 Q2',
                    'licensed': 3351,
                    'sorned': 629
                }, {
                    'period': '2011 Q1',
                    'licensed': 3269,
                    'sorned': 618
                }, {
                    'period': '2010 Q4',
                    'licensed': 3246,
                    'sorned': 661
                }, {
                    'period': '2009 Q4',
                    'licensed': 3171,
                    'sorned': 676
                }, {
                    'period': '2008 Q4',
                    'licensed': 3155,
                    'sorned': 681
                }, {
                    'period': '2007 Q4',
                    'licensed': 3226,
                    'sorned': 620
                }, {
                    'period': '2006 Q4',
                    'licensed': 3245,
                    'sorned': null
                }, {
                    'period': '2005 Q4',
                    'licensed': 3289,
                    'sorned': null
                }],
            xkey: 'step',
            ykey: ['licensed', 'sorned'],
            labels: ['Licensed', 'Off the road'],
            lineColors: ['rgb(233, 30, 99)', 'rgb(0, 188, 212)'],
            lineWidth: 3
        });
    }
}