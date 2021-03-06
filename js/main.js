;(function($){
  $(document).ready(function(){
    var originalArticle = $('article').html();

    $('header h1').click(function(){
      $('article').html(originalArticle);
    });

    $('[data-load]').click(function(){
      loadSample($(this).data('load'));
    });

    $('#get-new-sample').click(function(){
      loadRandomSample();
    });

    new Dragdealer('adjust-lineheight',{
      steps: 10 + 1,
      snap: true,
      speed: 0,
      x: (5/10),
      animationCallback: function(x, y) {
        var lineHeight = (1.25*x) + 1;
        $('article').css('line-height', lineHeight);
        $('#adjust-lineheight .handle')
          .text(lineHeight)
          .removeClass('normal warning-low warning-high bad')
          .addClass(alertLevel(2/10, 3/10, 7/10, 9/10, x));
        updateMetrics();
      }
    });

    new Dragdealer('adjust-width',{
      steps: 10 + 1,
      snap: true,
      speed: 0,
      x: (5/10),
      animationCallback: function(x, y) {
        var articleWidth = (1000*x) + 100; // 0 = 100px --> 1 = 1100px;
        $('article').css('width', articleWidth + 'px');
        $('#adjust-width .handle')
          .text(articleWidth + 'px')
          .removeClass('normal warning-low warning-high bad')
          .addClass(alertLevel(1/10, 2/10, 5/10, 7/10, x));
        updateMetrics();
      }
    });

    new Dragdealer('adjust-size',{
      steps: 10 + 1,
      snap: true,
      speed: 0,
      x: (5/10),
      animationCallback: function(x, y) {
        var fontSize = (20 * x) + 8; // 0 = 8px --> 1 = 28px;
        $('article').css('font-size', fontSize + 'px');
        $('#adjust-size .handle')
          .text(fontSize + 'px')
          .removeClass('normal warning-low warning-high bad')
          .addClass(alertLevel(2/10, 3/10, 7/10, 8/10, x));
        updateMetrics();
      }
    });

    new Dragdealer('adjust-color',{
      steps: 20 + 1,
      snap: true,
      speed: 0,
      x: (5/10),
      animationCallback: function(x, y) {
        var color = Math.floor(((170 * x) + 0)); // 0 = 0 --> 1 = 180
          // Yes, that's a weird stopping number, but we're showing hex anyway

        // Show users the hex color instead of X/255
        var hexcomponent = ("0" + color.toString(16)).substr(-2);
        var hexcolor = Array(4).join(hexcomponent);

        // Using logic informed by WebAIM (see next function's comment), get the
        // lightness for white and for the color dialed by the user.
        var lightness = getL(color);
        var white = getL(255); // The container background is white.

        var ratio = (white + 0.05)/(lightness + 0.05);
        var ratioText = (Math.round(ratio*100)/100) + ":1";

        $('article').css('color', '#' + hexcolor);

        // This would normally be alertLevel(), but the math is a little different
        // here. Adapted from http://webaim.org/resources/contrastchecker/contrastchecker.js
        var className;
        if ( ratio >= 7 ) {
          className = 'normal';
        } else if ( ratio >= 4.5 && ratio < 7 ) {
          className = 'warning-low';
        } else if ( ratio < 4.5 ) {
          className = 'bad';
        }

        $('#adjust-color .handle')
          .html("#" + hexcolor + ", &#9680; " + ratioText)
          .removeClass('normal warning-low warning-high bad')
          .addClass(className); // Set above instead of alertLevel()
      }
    });

    /**
     * This is very simplified but the code from WebAIM's contrast checker at
     * http://webaim.org/resources/contrastchecker/contrastchecker.js . This
     * revision doesn't take user input, assumes that the background is white,
     * assumes that the contrasting text color is greyscale, and does its work
     * with less code. But the mathematics involved are entirely WebAIM's. I
     * didn't want to screw with that because it is important that I give
     * correct examples.
     */
    function getL(value) {
      var X = value / 255;
          X = (X <= 0.03928) ? X/12.92 : Math.pow(((X + 0.055)/1.055), 2.4);
          // Originally this would be done for each of RGB components.
      var L = (0.2126 * X + 0.7152 * X + 0.0722 * X);
        // Originally:  R            G            B
      return L;
    }

    new Dragdealer('adjust-face',{
      steps: 5,
      snap: true,
      speed: 0,
      x: (1/2),
      animationCallback: function(x, y) {
        var newFaceIndex = Math.floor(((4 * x)));
        var faces = ['ptserif', 'crimson', 'opensans', 'lato', 'lobster'];
        var labels = ['PT Serif', 'Crimson', 'Open Sans', 'Lato', 'Lobster'];
        $('article')
          .removeClass(faces.join(' '))
          .addClass(faces[newFaceIndex]);
        $('#adjust-face .handle')
          .text(labels[newFaceIndex])
          .removeClass('normal warning-low warning-high bad')
          .addClass(alertLevel(-1, -1, 4/5, 6/5, x));
        updateMetrics();
      }
    });
  })

  $(window).load(function(){
    updateMetrics();
  });

  charsPerLine = function() {
    // The most easily understood metric is "characters per line":
    var elemHeight = $('article p:first').height();
    var lineHeight = parseInt( $('article p:first').css('line-height').replace('px','') );
    var characters = ( typeof($('article p:first')[0].innerText) === 'string' ) ?
      $('article p:first')[0].innerText.length :
      $('article p:first').text().replace(/\s+/ig, ' ').length;

    // When determining number of lines, we'll remove "half" a line. This
    // will help us account for the misleading quotient we'd get for short
    // final lines.
    var lines = (elemHeight / lineHeight) - .5;

    // Knowing these data, approximate our characters per line
    var cpl = Math.floor(characters / lines); // APPROXIMATE!

    $('#placeholder-characters-per-line')
      .html(cpl)
      .removeClass('normal warning-low warning-high bad')
      .addClass(alertLevel(20, 35, 90, 120, cpl));
  }

  lineLeading = function () {
    var fontSize = parseInt( $('article p:first').css('font-size').replace('px','') );
    var lineHeight = parseInt( $('article p:first').css('line-height').replace('px','') );
    var leading = lineHeight - fontSize;

    $('#placeholder-leading')
    .html(lineHeight + "px")
      .removeClass('normal warning-low warning-high bad')
      .addClass(alertLevel(0.12, 0.33, 0.76, 1, leading / fontSize));
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

  updateMetrics = function() {
    setTimeout(charsPerLine, 1000);
    setTimeout(lineLeading, 1000);
  }

  loadSample = function(sample){
    $.ajax({
      dataType: "html",
      url:('/copy/' + sample),
      cache: true
    }).done(function(data){
        $('article').html(data);
        setTimeout(charsPerLine, 1000);
        ga('send', 'pageview', '/copy/' + sample);
      })
      .fail(function(){
        alert('Unable to load text.');
      })
  }

  loadRandomSample = function() {
    $.ajax({
      dataType: "json",
      url:'/copy/manifest.json',
      cache: true
    }).done(function(data){
        var sample = data[Math.floor(Math.random()*data.length)];
        loadSample(sample);
      })
      .fail(function(jqXhr, textStatus, error){
        alert('Unable to load text: ' + textStatus);
      })
  }
})(jQuery);
