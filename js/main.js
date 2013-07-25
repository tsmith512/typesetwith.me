;(function($){
  $(document).ready(function(){
    new Dragdealer('adjust-lineheight',{
      steps: 10 + 1,
      snap: true,
      x: (5/10),
      animationCallback: function(x, y) {
        var lineHeight = 1.25*x + 0.75;
        $('article').css('line-height', lineHeight);
        $('#adjust-lineheight .handle').text(lineHeight);
      }
    });

    new Dragdealer('adjust-width',{
      steps: 10 + 1,
      snap: true,
      x: (5/10),
      animationCallback: function(x, y) {
        var articleWidth = (60 * x) + 20; // 0 = 20em --> 1 = 80em;
        $('article').css('width', articleWidth + 'em');
        $('#adjust-width .handle').text(articleWidth + 'em');

        setTimeout(charsPerLine, 1000);
      }
    });
  })

  $(window).load(function(){
    setTimeout(charsPerLine, 1000);
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

    $('#characters-per-line').text(cpl);
  }

})(jQuery);