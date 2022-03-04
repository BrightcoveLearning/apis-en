$(document).ready(function() {
    var $projectList = $("#projectList"),
        $projectItems = $("#projectList li"),
        $projectTitles = $("#projectList li h5"),
        $projectSelectWrapper = $("#projectSelectWrapper"),
        $projectSelect,
        dataObj = {},
        projectListTemplate = "<select id=\"projectSelect\"><option>Select a Project</option>{{#items}}<option class=\"projectSelectItem\" value=\"{{id}}\">{{name}}</option>{{/items}}</select> ",
        template,
        result;
    // add ids to project items
    $projectItems.each(function(index) {
        $(this).attr("id", index);
    });
    dataObj.items = [];
    $projectTitles.each(function(index) {
        dataObj.items[index] = {
            id: index,
            name: $(this).text()
        }
    });
    template = Handlebars.compile(projectListTemplate);
    result = template(dataObj);
    $projectSelectWrapper.html(result);
    $projectSelect = $("#projectSelect");
    $projectSelect.on("change", function() {
        window.location = "#" + $projectSelect.val();
    });
});
