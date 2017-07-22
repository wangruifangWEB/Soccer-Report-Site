function updateTag(selectObj) {
    var tag = $(selectObj).find("option:selected").parent("optgroup").attr("label");
    $(selectObj).prev().html(tag);
}

function improveSelects() {
    $("select").not("[multiple]").filter(function() {
        return $(this).attr("data-key") == "label";
    }).each(function() {
        $(this).before(
            `
                <span class="label label-xs label-default"></span>
            `
        );

        setTimeout(() => {
            $(this).change(function() {
                updateTag(this);
            });
            updateTag(this);
        }, 400);
    });
}
