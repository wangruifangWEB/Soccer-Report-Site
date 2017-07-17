function visualize(selector, spec, data) {
    var chart = echarts.init($(selector)[0]);
    var ecSpec = spec.spec;
    var type = spec.type;
    var stack = spec.stack;

    ecSpec.grid = {
        "bottom": 100,
        "containLabel": "true"
    };

    ecSpec.tooltip = {
        "trigger": "axis",
        "axisPointer" : {
            "type" : "shadow"
        }
    };

    ecSpec.toolbox = {
        "feature" : {
            "saveAsImage" : {
                "title": "Save as Image"
            }
        },
        "right": 50
    };

    if ("columnField" in spec) {
        var clean_data = _.filter(data, r => r["Score"] !== null);

        ecSpec.xAxis.data = _.uniq(_.map(clean_data, r => r[spec.xField]));

        var match_num = _.range(0, ecSpec.xAxis.data.length);

        ecSpec.series = _.map(
            _.groupBy(clean_data, r => r[spec.columnField]),
            (g, k) => ({
                name: k,
                type: type,
                data: _.map(g, r => [r[spec.xField].toString(), r[spec.yField]]),
                stack: stack,
                barMaxWidth: '50',
                barGap: "10%"
            })
        ).concat(_.map(
            _.groupBy(clean_data, r => r[spec.columnField]),
            (g, k) => ({
                name: k,
                type: "line",
                showSymbol: false,
                data: _.zip(
                    _.map(g, r => r[spec.xField].toString()),
                    _.map(
                        ecStat.regression(
                            'linear',
                            _.zip(match_num, _.map(g, r => r[spec.yField]))
                        ).points,
                        r => r[1]
                    )
                ),
                tooltip: {
                    show: false
                }
            })
        ));

        ecSpec.legend = {
            data: _.map(data, r => r[spec.columnField])
        };
    }
    else if ("rowField" in spec) {
        ecSpec.yAxis.data = _.uniq(_.map(data, r => r[spec.yField]));

        ecSpec.series = _.map(
            _.groupBy(data, r => r[spec.rowField]),
            (g, k) => {
                return {
                    name: k,
                    type: type,
                    data: _.map(g, r => [r[spec.xField], r[spec.yField].toString()]),
                    stack: stack,
                    barMaxWidth: '50',
                    barGap: "10%"
                };
            }
        );

        ecSpec.legend = {
            data: _.map(data, r => r[spec.rowField])
        };
    }
    else {
        ecSpec.xAxis.data = _.uniq(
            _.map(
                _.filter(
                    _.map(data, r => [r[spec.xField], r[spec.yField]]),
                    ([name, score]) => score !== null
                ),
                g => g[0]
                )
            );

        ecSpec.series = [{
            data: _.filter(
                _.map(data, r => r[spec.yField]),
                score => score !== null
            ),
            type: type,
            barMaxWidth: '50',
            barGap: "10%",
            markLine: {
                data: [
                    {
                        type: "average"
                    }
                ],
                lineStyle: {
                    normal: {
                        color: "rgb(0, 102, 153)",
                        width: 2
                    }
                }
            }
        }];
    }

    chart.setOption(ecSpec, true);
}
