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
      var isbnList = [];
      items.each(function() {
        var isbn = $(this).attr('data-isbn');
        str +=
          '\n＊書名　　　　：' + $(this).next().text() +
          '\n（著者）　　　：' +
          '\n＊出版社　　　：' + $(this).attr('data-publisher') +
          '\n＊ＩＳＢＮ　　：' + isbn +
          '\n（本体価格）　：\n';
        isbnList.push(isbn);
      });
      $('div#selected > pre').empty().append(str);

      $.ajax({
        type: 'post',
        url:  '/checkout',
        data: { isbnList: isbnList },
        dataType: 'json'
      });

      items.toggleClass('icon-check').toggleClass('icon-check-sign')
    } else {
      alert('Select item!');
    }
  });
})(jQuery);