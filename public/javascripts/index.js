(function($) {
  if ($('button > i.icon-github-sign').length === 1) {
    $('div.checkable > i').removeClass('icon-check-empty').addClass('icon-book');
  }

  $('div.checkable > i.icon-check-empty').click(function() {
    $(this).toggleClass('icon-check-empty').toggleClass('icon-check');
  });

  $('div.checkable > i.icon-check').click(function() {
    $(this).toggleClass('icon-check-empty').toggleClass('icon-check');
  });

  $('button#output').click(function() {
    var items = $('div.checkable > i.icon-check');
    if (items.length > 0) {
      var str = '';
      items.each(function() {
        str +=
          '＊書名　　　　：' + $(this).next().text() + '\n' +
          '（著者）　　　：\n' +
          '＊出版社　　　：' + $(this).attr('data-publisher')+ '\n' +
          '＊ＩＳＢＮ　　：' + $(this).attr('data-isbn') + '\n' +
          '（本体価格）　：' + '\n' + '\n';
      });
      $('div#selected > pre').empty().append(str);
    } else {
      alert('Select item!');
    }
  });
})(jQuery);