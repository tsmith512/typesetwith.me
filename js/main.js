;(function($){
  $(document).ready(function(){
    $('[data-load]').click(function(){
      loadSample($(this).data('load'));
    })

    new Dragdealer('adjust-lineheight',{
      steps: 10 + 1,
      snap: true,
      x: (5/10),
      animationCallback: function(x, y) {
        var lineHeight = (1.25*x) + 1;
        $('article').css('line-height', lineHeight);
        $('#adjust-lineheight .handle')
          .text(lineHeight)
          .removeClass('normal warning-low warning-high bad')
          .addClass(alertLevel(2/10, 4/10, 6/10, 9/10, x));
        setTimeout(lineLeading, 1000);
      }
    });

    new Dragdealer('adjust-width',{
      steps: 10 + 1,
      snap: true,
      x: (5/10),
      animationCallback: function(x, y) {
        var articleWidth = (1000*x) + 100; // 0 = 100px --> 1 = 1100px;
        $('article').css('width', articleWidth + 'px');
        $('#adjust-width .handle')
          .text(articleWidth + 'px')
          .removeClass('normal warning-low warning-high bad')
          .addClass(alertLevel(1/10, 2/10, 5/10, 7/10, x));
        setTimeout(charsPerLine, 1000);
      }
    });

    new Dragdealer('adjust-size',{
      steps: 10 + 1,
      snap: true,
      x: (5/10),
      animationCallback: function(x, y) {
        var fontSize = (20 * x) + 8; // 0 = 8px --> 1 = 28px;
        $('article').css('font-size', fontSize + 'px');
        $('#adjust-size .handle')
          .text(fontSize + 'px')
          .removeClass('normal warning-low warning-high bad')
          .addClass(alertLevel(2/10, 3/10, 7/10, 8/10, x));
        setTimeout(charsPerLine, 1000);
      }
    });

    new Dragdealer('adjust-color',{
      steps: 10 + 1,
      snap: true,
      x: (5/10),
      animationCallback: function(x, y) {
        var color = Math.floor(((200 * x) + 0)); // 0 = 0 --> 1 = 200
        $('article').css('color', 'rgb(' + color + ',' + color + ',' + color + ')');
        $('#adjust-color .handle')
          .text(color + '/255')
          .removeClass('normal warning-low warning-high bad')
          .addClass(alertLevel(1/10, 3/10, 7/10, 8/10, x));
      }
    });
  })

  $(window).load(function(){
    setTimeout(charsPerLine, 1000);
    setTimeout(lineLeading, 1000);
  });

  charsPerLine = function() {
    // The most easily understood metric is "characters per line":
    var elemHeight = $('article p:first').height();
    var lineHeight = parseInt( $('article p:first').css('line-height').replace('px','') );
    var characters = $('article p:first').text().length;

    // When determining number of lines, we'll remove "half" a line. This
    // will help us account for the misleading quotient we'd get for short
    // final lines.
    var lines = (elemHeight / lineHeight) - .5;
    
    // Knowing these data, approximate our characters per line
    var cpl = Math.floor(characters / lines); // APPROXIMATE!

    $('#placeholder-characters-per-line').text(cpl);
  }

  lineLeading = function () {
    var fontSize = parseInt( $('article p:first').css('font-size').replace('px','') );
    var lineHeight = parseInt( $('article p:first').css('line-height').replace('px','') );
    var leading = lineHeight - fontSize;

    $('#placeholder-leading').text(leading + "px");
  }

  alertLevel = function(min, low, high, max, current) {
    if ( low <= current && current <= high ) {
      return 'normal';
    } else if ( high < current && current <= max ) {
      return 'warning-high';
    } else if ( min <= current && current < low ) {
      return 'warning-low';
    } else if ( current < min || current > max ) {
      return 'bad';
    }
  }

  loadSample = function(sample){
    $.get('/copy/' + sample)
      .done(function(data){ $('article').html(data) })
      .fail(function(){ alert('Unable to load text.'); })
  }

})(jQuery);