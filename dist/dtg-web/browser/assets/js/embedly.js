(function (w, d) {

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      var id = 'embedly-platform', n = 'script';
      if (!d.getElementById(id)) {
        w.embedly = w.embedly || function () { (w.embedly.q = w.embedly.q || []).push(arguments); };
        var e = d.createElement(n); e.id = id; e.async = 1;
        e.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://cdn.embedly.com/widgets/platform.js';
        var s = d.getElementsByTagName(n)[0];
        s.parentNode.insertBefore(e, s);
        console.log('perro')
      }
    }, 2000);

  });

})(window, document);