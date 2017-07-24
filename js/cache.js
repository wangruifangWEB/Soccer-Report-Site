var alertTimeout = null;

function cachedJSON(url, func) {
    var response;
    if (!localStorage.getItem(url)) {
        $('#syncAlert').fadeIn();

        $.getJSON(url, response => {
            localStorage.setItem(url, JSON.stringify(response));

            func(response);
        }).done(
            () => $('#offlineAlert').fadeOut()
        ).fail(
            () => $('#offlineAlert').fadeIn()
        ).always(() => {
            if (alertTimeout) {
                clearTimeout(alertTimeout);
            }
            alertTimeout = setTimeout(() => $('#syncAlert').fadeOut(), 1000);
        });
    } else {
        response = JSON.parse(localStorage.getItem(url));
        func(response);
    }
}
