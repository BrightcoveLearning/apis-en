var BCLS_share = ( function (window, document, BCLS_toc, Prism) {
  document.onload = function() {
    $(function() {
      if (shared_content) {
        console.log('shared_content', shared_content);
        $('#bcls_article').load(
          'https://general.support.brightcove.com' + shared_content
        );
      }
    });
    // when TOC generator runs, it plants the side_nav_created flag; check not done
    BCLS_toc.create_inpage_nav();
    Prism.highlightAll();
  };
})(window, document, BCLS_toc, Prism);