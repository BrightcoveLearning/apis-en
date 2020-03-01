var BCLS_share = ( function (window, document, BCLS_toc, Prism) {
  console.log('shared_content', shared_content);
  if (shared_content && shared_content.length > 0) {
  document.onload = function() {
    $(function() {
      console.log('here');
        $('#bcls_article').load(
          console.log('still here');
          'https://general.support.brightcove.com' + shared_content
        );
      });
    }
    // when TOC generator runs, it plants the side_nav_created flag; check not done
    BCLS_toc.create_inpage_nav();
    Prism.highlightAll();
  };
})(window, document, BCLS_toc, Prism);