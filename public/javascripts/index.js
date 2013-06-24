(function($) {
  var onClickCheckEmpty = function() {
    $(this).toggleClass('icon-check-empty').toggleClass('icon-check');
    $(this).off('click').click(onClickCheck);
  };

  var onClickCheck = function() {
    $(this).toggleClass('icon-check-empty').toggleClass('icon-check');
    $(this).off('click').click(onClickCheckEmpty);
  };

  var onClickCheckSign = function() {
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
  };

  var initialize = function() {
    if ($('button > i.icon-github-sign').length === 1) {
      $('div.checkable > i')
      .removeClass('icon-check-empty')
      .removeClass('icon-check')
      .removeClass('icon-check-sign')
      .addClass('icon-book');
    }

    $('div.searchbar > button').off('click').click(function() {
      var keywords = $('div.searchbar > input').val();
      if (keywords === null || keywords.length < 1) {
        return;
      }
      $('div.searchbar > input').val('');

      $.ajax({
        type: 'get',
        url: '/catalog/amazon',
        dataType: 'json',
        data: { keywords: keywords }
      }).done(function(results) {
        $('section.amazon > div.checkable').remove();
        results.forEach(function(item) {
          var $checkableDiv = $('<div class="checkable"></div>');
          var $checkIcon = item.registered ? $('<i class="icon-check-sign icon-large"></i>') : $('<i class="icon-check-empty icon-large"></i>');
          $checkIcon.attr('data-isbn', item.isbn).attr('data-publisher', item.publisher);
          $checkableDiv.append($checkIcon);
          $checkableDiv.append($('<a></a>').attr('href', item.href).attr('target', '_blank').append(item.title));
          $('section.amazon').append($checkableDiv);
          initialize();
        });
      });
    });

    $('div.checkable > i.icon-check-empty').off('click').click(onClickCheckEmpty);
    $('div.checkable > i.icon-check').off('click').click(onClickCheck);
    $('div.checkable > i.icon-check-sign').off('click').click(onClickCheckSign);
    $('button#output').off('click').click(function() {
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
        console.log(isbnList);
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
  };
  initialize();
})(jQuery);