function loadText(id, dataID, obj, subscribe) {
    obj.find(".vis-text").each(function() {
        var textObj = $(this);

        subscribe(textObj, response => {
            textObj.addClass("updated");
            setTimeout(() => textObj.removeClass("updated"), 400);

            textObj.html(response.data);
        });
    });
}

function loadFigure(id, dataID, obj, subscribe) {
    obj.find(".vis-figure").each(function() {
        var figureObj = $(this);

        cachedJSON(`vis/${dataID}.json`, response => {
            var spec = response;

            subscribe(figureObj, response => {
                visualize(this, spec, response.data);
            });
        });
    });
}

function loadTable(id, dataID, obj, subscribe) {
    obj.find(".vis-table").each(function() {
        var tableObj = $(this);
        var table = null;

        subscribe(tableObj, response => {
            if (table) {
                table.destroy();
                tableObj.empty();
            }

            table = tableObj.DataTable({
                "data": _.rest(response.data),
                "columns": _.map(response.data[0], v => ({title: v})),
                "displayLength": -1,
                "paging": false,
                "ordering": false,
                "info": false,
                "searching": false,
                "scrollY": true,
                "scrollX": true,
                "scrollCollapse": true,
                "fixedColumns": true
            });

            var actives = tableObj.data("actives");
            if (actives) {
                _.each(actives.split(' '), p => {
                    $(`#${id} .vis-table tbody tr:nth-last-child(${-parseInt(p)})`).addClass('active');
                });
            }

            $(this).children('tbody').children('tr').on({
                mouseenter: function () {
                    trIndex = $(this).index()+1;
                    $("table.dataTable").each(function(index) {
                        $(this).find("tr:eq("+trIndex+")").each(function(index) {
                            $(this).find("td").addClass("hovered");
                        });
                    });
                },
                mouseleave: function () {
                    trIndex = $(this).index()+1;
                    $("table.dataTable").each(function(index) {
                        $(this).find("tr:eq("+trIndex+")").each(function(index) {
                            $(this).find("td").removeClass("hovered");
                        });
                    });
                }
            });

            obj.find(".DTFC_Cloned").each(function() {
                var clonedColObj = $(this);

                subscribe(clonedColObj, response => {
                    $(this).children('tbody').children('tr').on({
                        mouseenter: function () {
                            trIndex = $(this).index()+1;
                            $("table.dataTable").each(function(index) {
                                $(this).find("tr:eq("+trIndex+")").each(function(index) {
                                    $(this).find("td").addClass("hovered");
                                });
                            });
                        },
                        mouseleave: function () {
                            trIndex = $(this).index()+1;
                            $("table.dataTable").each(function(index) {
                                $(this).find("tr:eq("+trIndex+")").each(function(index) {
                                    $(this).find("td").removeClass("hovered");
                                });
                            });
                        }
                    });
                });
            });
        });
    });
}

function load(id, dataID, obj, subscribe) {
    loadText(id, dataID, obj, subscribe);
    loadFigure(id, dataID, obj, subscribe);
    loadTable(id, dataID, obj, subscribe);
}
