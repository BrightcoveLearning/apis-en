---
layout: null
---

var BCLS_share = ( function (window, document, BCLS_toc, Prism) {
  window.onload = function() {
    console.log('here');
    $(function() {
      $('#bcls_article').load(
        'https://general.support.brightcove.com/content/' + shared_content
      );
      console.log('page name', shared_content);
      
      BCLS_toc.create_inpage_nav();
      Prism.highlightAll();
    });
  };
})(window, document, BCLS_toc, Prism);