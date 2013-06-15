(function($) {
  if ($('button > i.icon-github-sign').length === 1) {
    $('div.checkable > i').removeClass('icon-check-empty').addClass('icon-book');
  }

  function onClickCheckEmpty() {
    $(this).toggleClass('icon-check-empty').toggleClass('icon-check');
    $(this).off('click').click(onClickCheck);
  }

  function onClickCheck() {
    $(this).toggleClass('icon-check-empty').toggleClass('icon-check');
    $(this).off('click').click(onClickCheckEmpty);
  }

  function onClickCheckSign() {
    if (!confirm('Do you want to return a book?')) {
      return;
    }
    var isbn = $(this).attr('data-isbn');
    $.ajax({
      type: 'delete',
      url: '/checkin/' + isbn
    });
    $(this).toggleClass('icon-check-sign').toggleClass('icon-check-empty');
    $(this).off('click').click(onClickCheckEmpty);
  }

  $('div.checkable > i.icon-check-empty').click(onClickCheckEmpty);
  $('div.checkable > i.icon-check').click(onClickCheck);
  $('div.checkable > i.icon-check-sign').click(onClickCheckSign);

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
      items.toggleClass('icon-check').toggleClass('icon-check-sign');
      items.off('click').click(onClickCheckSign);
    } else {
      alert('Select item!');
    }
  });
})(jQuery);