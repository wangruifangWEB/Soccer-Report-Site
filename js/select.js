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

function getOptionsHTML(list, key) {
    var options = "";

    if (!key) {
        _.each(list, o => {
            options += `<option value="${o}">${o}</option>`;
        });
    }
    else {
        _.each(_.filter(list, o => !o.key), o => {
            options += `<option value="${o.value}">${o.value}</option>`;
        });

        _.each(_.groupBy(_.filter(list, o => o.key), o => o.key), (l, g) => {
            options += `<optgroup label="${g}">`;

            _.each(l, o => {
                options += `<option value="${o.value}">${o.value}</option>`;
            });

            options += `</optgroup>`;
        });
    }

    return options;
}

function setDefaultPos(selectObj, defaultPos, key) {
    if (!defaultPos) {
        if (selectObj.prop("multiple")) {
            selectObj.find(`option`).prop("selected", true);
        }
        else {
            selectObj.find(`option:first-of-type`).prop("selected", true);
        }
    }
    else {
        if (!key) {
            selectObj.find(`option:nth-${defaultPos >= 0 ? '' : 'last-'}of-type(${Math.abs(defaultPos)})`).prop("selected", true);
        }
        else {
            selectObj.find(`optgroup:nth-${defaultPos >= 0 ? '' : 'last-'}of-type(${Math.abs(defaultPos)}) > option:first-of-type`).prop("selected", true);
        }
    }
}
