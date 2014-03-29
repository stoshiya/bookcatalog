(function($) {
  var onClickCheckEmpty = function() {
    $(this).toggleClass('fa-check-square-o').toggleClass('fa-square-o');
    $(this).off('click').click(onClickCheck);
  };

  var onClickCheck = function() {
    $(this).toggleClass('fa-check-square-o').toggleClass('fa-square-o');
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
    $(this).toggleClass('fa-check-square').toggleClass('fa-square-o');
    $(this).off('click').click(onClickCheckEmpty);
  };

  var searchHandler = function() {
    var keywords = $('div.searchbar > input').val();
    if (keywords === null || keywords.length < 1) {
      return;
    }

    $.ajax({
      type: 'get',
      url: '/catalog/amazon',
      dataType: 'json',
      data: { keywords: keywords }
    }).done(function(results) {
        $('section.amazon > div.checkable').remove();
        results.forEach(function(item) {
          var $checkableDiv = $('<div class="checkable"></div>');
          var $checkIcon = item.registered ? $('<i class="fa fa-lg fa-check-square"></i>') : $('<i class="fa fa-lg fa-square-o"></i>');
          $checkIcon.attr('data-isbn', item.isbn).attr('data-publisher', item.publisher);
          $checkableDiv.append($checkIcon);
          $checkableDiv.append($('<a></a>').attr('href', item.href).attr('target', '_blank').append(item.title));
          $('section.amazon').append($checkableDiv);
          initialize();
        });
      });
  };

  var initialize = function() {
    if ($('button > i.fa-github').length === 1) {
      $('div.checkable > i')
        .removeClass('fa-square-o')
        .removeClass('fa-check-square-o')
        .removeClass('fa-check-square')
        .addClass('fa-book');
    }

    $('div.searchbar > button').off('click').click(searchHandler);
    $(document).keydown(function(e) {
      if (e.keyCode === 13) { // Enter
        searchHandler();
      }
    });

    $('div.checkable > i.fa-square-o').off('click').click(onClickCheckEmpty);
    $('div.checkable > i.fa-check-square-o').off('click').click(onClickCheck);
    $('div.checkable > i.fa-check-square').off('click').click(onClickCheckSign);
    $('button#output').off('click').click(function() {
      var items = $('div.checkable > i.fa-check-square-o');
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
        items.toggleClass('fa-check-square-o').toggleClass('fa-check-square');
        items.off('click').click(onClickCheckSign);
      } else {
        alert('Select item!');
      }
    });
  };
  initialize();
})(jQuery);