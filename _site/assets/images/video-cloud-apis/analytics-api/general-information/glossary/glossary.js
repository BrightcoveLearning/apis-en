var BCLS = ( function ($, window, document, aapi_model) {
    var dimension_list = document.getElementById("dimension_list"),
        i,
        iMax = aapi_model.dimensions.length,
        dimension;
    for (i = 0; i < iMax; i++) {
        dimension = aapi_model.dimensions[i];
        dimension_list.innerHTML += "<li><a href="#" + dimension.name + "">" + dimension.name + "</a></li>"
    }

    return {

    }
})($, window, document, aapi_model);
