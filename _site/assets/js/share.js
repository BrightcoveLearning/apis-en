var BCLS_share = ( function (window, document, BCLS_toc, Prism) {
  window.onload = function() {
    $(function() {
      $('#bcls_article').load(
        'https://general.support.brightcove.com/content/' + share.js
      );
      console.log('page name', share.js);
      
      BCLS_toc.create_inpage_nav();
      Prism.highlightAll();
    });
  };
})(window, document, BCLS_toc, Prism);