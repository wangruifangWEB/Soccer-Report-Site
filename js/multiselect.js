function selectAll(buttonObj, value) {
    var select = $(buttonObj).parent().next();
    select.find('option').prop("selected", value);
    select.change();
}

function improveMultiSelects() {
    $("select[multiple]").each(function() {
        $(this).before(
            `
            <div style="float: right">
                <button type="button" class="btn btn-xs btn-info btn-select-none">None</button>
                <button type="button" class="btn btn-xs btn-info btn-select-all">All</button>
            </div>
            `
        );
    });

    setTimeout(() => {
        $(".btn-select-none").click(function() {
            selectAll(this, false);
        });

        $(".btn-select-all").click(function() {
            selectAll(this, true);
        });
    }, 400);
}
