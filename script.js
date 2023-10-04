$(document).ready(function() {
  var tooltipContainers = [];

  function createAndShowTooltip(element, text) {
    var offset = $(element).offset();
    var newTooltipContainer = $('<div></div>')
      .appendTo(document.body)
      .attr({
        'data-toggle': 'tooltip',
        'data-html': 'true',
        'title': text,
        'data-placement': 'top',
        'data-trigger': 'manual'
      })
      .css({
        'position': 'absolute',
        'left': offset.left + 'px',
        'top': (offset.top - 30) + 'px'
      });

    newTooltipContainer.tooltip();
    newTooltipContainer.tooltip('show');
    tooltipContainers.push(newTooltipContainer);
  }

  var sidebarTextNodes = $("#sidebar *:not(:has(*))");
  var mainTextNodes = $("#main *:not(:has(*))");

  sidebarTextNodes.each(function() {
    var text = $(this).text();
    if (text.trim() !== '') {
      createAndShowTooltip(this, text);
    }
  });

  mainTextNodes.each(function() {
    var text = $(this).text();
    if (text.trim() !== '') {
      createAndShowTooltip(this, text);
    }
  });
});