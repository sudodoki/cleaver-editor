require('angular')
var Cleaver = require('./patched-cleaver')
var saveAs = require('./FileSaver');
var app = angular.module('cleaver-app', [])

// This code sucks, but it works, so STAY CALM & REFACTOR LATER
app.controller('EditCtrl', function($scope, $element, cleaver){
  var html, watchHandler;
  $scope.models = {
    'slides': "title: Basic Example\nauthor:\n  name: Jordan Scales\n  twitter: jdan\n  url: http://jordanscales.com\noutput: index.html\n\n--\n\n# Cleaver 101\n## A first look at quick HTML presentations\n\n--\n\n### A textual example\n\nContent can be written in **Markdown!** New lines no longer need two angle brackets.\n\nThis will be in a separate paragraph.\n\n<img src=\"http://whatismarkdown.com/workspace/img/logo.gif\" alt=\"Drawing\" style=\"width: 150px;\"/>\n\n    ![markdown-logo](logo.gif)\n    <img src=\"logo.gif\" />\n\n[Here's a link](http://google.com).\n\n--\n\n### A list of things\n\n* Item 1\n* Item B\n* Item gamma\n\nNo need for multiple templates! [Another link](http://google.com).\n\n--\n\n### Unicode\n\n* 林花謝了春紅 太匆匆\n* 胭脂淚 留人醉 幾時重\n* Matching Pairs «»‹› “”‘’「」〈〉《》〔〕\n* Greek αβγδ εζηθ ικλμ νξοπ ρςτυ φχψω\n* currency  ¤ $ ¢ € ₠ £ ¥\n\n--\n\n### A code example\n\n```javascript\n// cool looking code\nvar func = function (arg1) {\n    return function (arg2) {\n        return \"arg1: \" + arg1 + \"arg2: \" + arg2;\n    };\n};\n\nconsole.log(func(1)(2)); // result is three\n```\n\nAnd here is some `inline code` to check out.",
    'layout': '<!doctype html>\n<html>\n<head>\n  <meta charset="{{encoding}}">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">\n  <title>{{title}}</title>\n  <style type="text/css">\n    {{{style}}}\n  </style>\n</head>\n<body>\n  {{{slideshow}}}\n\n  <script type="text/javascript">\n    {{{script}}}\n  </script>\n</body>\n</html>\n',
    'author_slide': '<div class="author">\n  <h1 class="name">{{name}}</h1>\n  {{#twitter}}\n    <h3 class="twitter">\n      <a href="http://twitter.com/{{{twitter}}}">{{{twitter}}}</a>\n    </h3>\n  {{/twitter}}\n  {{#url}}\n    <h3 class="url">\n      <a href="{{{url}}}">{{{url}}}</a>\n    </h3>\n  {{/url}}\n  {{#email}}\n    <h3 class="email">\n      <a href="mailto:{{{email}}}">{{{email}}}</a>\n    </h3>\n  {{/email}}\n</div>\n',
    'agenda': '<h3>Agenda</h3>\n<ul>\n  {{#.}}\n    <li>{{.}}</li>\n  {{/.}}\n</ul>\n',
    'slides_layout': '{{#progress}}\n  <div class="progress">\n    <div class="progress-bar"></div>\n  </div>\n{{/progress}}\n\n<div id="wrapper">\n  {{#slides}}\n    <section class="slide">{{{.}}}</section>\n  {{/slides}}\n</div>\n{{#controls}}\n  <div class="controls">\n    <div class="arrow prev"></div>\n    <div class="arrow next"></div>\n  </div>\n{{/controls}}\n'
  };
  $scope.updateSlides = function() {
    html = cleaver.render($scope.models);
    $scope.rerenderFrame(html);
  }
  $scope.savePresentation = function() {
    if (!html) {return alert('nothing to save, lol')}
    var blob = new Blob([html], {type: "text/html;charset=utf-8"});
    saveAs(blob, "Presentation.html");
  }
  $scope.saveOrigin = function() {
    if (!$scope.models.slides) {return alert('nothing to save, lol')}
    var blob = new Blob([$scope.models.slides], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "Presentation.md");
  }
  $scope.rerenderFrame = function(html) {
    var ifrm = $element.find('iframe')[0];
    ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;       
    ifrm.document.open('replace');
    ifrm.document.write(html);
    ifrm.document.close();
  }
  $scope.updateSlides();
  $scope.constantUpdate = true
  $scope.$watch('constantUpdate', function(newVal, oldVal){
    if (watchHandler) { watchHandler() }
    if (!newVal) { return }
    watchHandler = $scope.$watch('models', $scope.updateSlides, true)
  })
  $scope.setTab = function(tabName) {
    return $scope.active = tabName;
  }
  $scope.isActive = function (tabName) {
    return tabName === $scope.active;
  }

  $scope.tabs = [
    'slides',
    'layout',
    'author_slide',
    'agenda',
    'slides_layout'
  ];
})

app.directive('navTabs', function() {
  return {
    restrict: "E",
    template: "<nav class='nav-list'><li ng-class='{active: isActive(tab)}' class='nav-item' title='{{tab}}' ng-repeat='tab in tabs' ng-click='setTab(tab)'>{{ spacify(capitalize(tab)) }}</li></nav>",
    scope: false,
    replace: true,
    link: function(scope, el, attrs) {
      scope.capitalize = function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      scope.spacify = function spacify(str) {
        return str.replace(/_/g, ' ');
      }
      el.on('click', function (e) {
        scope.setTab(e.target.title)
      })
    }
  }
})

app.service('cleaver', function() {
  var cleaver = new Cleaver('http://lol-doesnt-matter.txt')
  cleaver.external = {
    document: 'http://lol.txt',
    loaded: {
      document: "title: Basic Example\nauthor:\n  name: Jordan Scales\n  twitter: jdan\n  url: http://jordanscales.com\noutput: index.html\n\n--\n\n# Cleaver 101\n## A first look at quick HTML presentations\n\n--\n\n### A textual example\n\nContent can be written in **Markdown!** New lines no longer need two angle brackets.\n\nThis will be in a separate paragraph.\n\n<img src=\"http://whatismarkdown.com/workspace/img/logo.gif\" alt=\"Drawing\" style=\"width: 150px;\"/>\n\n    ![markdown-logo](logo.gif)\n    <img src=\"logo.gif\" />\n\n[Here's a link](http://google.com).\n\n--\n\n### A list of things\n\n* Item 1\n* Item B\n* Item gamma\n\nNo need for multiple templates! [Another link](http://google.com).\n\n--\n\n### Unicode\n\n* 林花謝了春紅 太匆匆\n* 胭脂淚 留人醉 幾時重\n* Matching Pairs «»‹› “”‘’「」〈〉《》〔〕\n* Greek αβγδ εζηθ ικλμ νξοπ ρςτυ φχψω\n* currency  ¤ $ ¢ € ₠ £ ¥\n\n--\n\n### A code example\n\n```javascript\n// cool looking code\nvar func = function (arg1) {\n    return function (arg2) {\n        return \"arg1: \" + arg1 + \"arg2: \" + arg2;\n    };\n};\n\nconsole.log(func(1)(2)); // result is three\n```\n\nAnd here is some `inline code` to check out."
    }
  }

  cleaver.templates.loaded ={ 
    layout: '<!doctype html>\n<html>\n<head>\n  <meta charset="{{encoding}}">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">\n  <title>{{title}}</title>\n  <style type="text/css">\n    {{{style}}}\n  </style>\n</head>\n<body>\n  {{{slideshow}}}\n\n  <script type="text/javascript">\n    {{{script}}}\n  </script>\n</body>\n</html>\n',
    author: '<div class="author">\n  <h1 class="name">{{name}}</h1>\n  {{#twitter}}\n    <h3 class="twitter">\n      <a href="http://twitter.com/{{{twitter}}}">{{{twitter}}}</a>\n    </h3>\n  {{/twitter}}\n  {{#url}}\n    <h3 class="url">\n      <a href="{{{url}}}">{{{url}}}</a>\n    </h3>\n  {{/url}}\n  {{#email}}\n    <h3 class="email">\n      <a href="mailto:{{{email}}}">{{{email}}}</a>\n    </h3>\n  {{/email}}\n</div>\n',
    agenda: '<h3>Agenda</h3>\n<ul>\n  {{#.}}\n    <li>{{.}}</li>\n  {{/.}}\n</ul>\n',
    slides: '{{#progress}}\n  <div class="progress">\n    <div class="progress-bar"></div>\n  </div>\n{{/progress}}\n\n<div id="wrapper">\n  {{#slides}}\n    <section class="slide">{{{.}}}</section>\n  {{/slides}}\n</div>\n{{#controls}}\n  <div class="controls">\n    <div class="arrow prev"></div>\n    <div class="arrow next"></div>\n  </div>\n{{/controls}}\n' 
  }

  cleaver.renderSlides()

  cleaver.metadata.controls = true
  cleaver.metadata.progress = true

  cleaver.resources = cleaver.resources || {} 
  cleaver.resources.loaded = {
    style: 'body {\n  font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif;\n  color: #222;\n  background-color: #f7f7f7;\n  font-size: 100%;\n}\n\n#wrapper {\n  width: 850px;\n  height: 600px;\n  overflow: hidden;\n  margin: 80px auto 0 auto;\n}\n\n.slide {\n  width: auto;\n  height: 540px;\n  padding: 30px;\n  font-weight: 200;\n  font-size: 200%;\n  line-height: 1.375;\n}\n\n.controls {\n  position: absolute;\n  bottom: 20px;\n  left: 20px;\n}\n\n.controls .arrow {\n  width: 0; height: 0;\n  border: 30px solid #333;\n  float: left;\n  margin-right: 30px;\n\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -khtml-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n\n.controls .prev {\n  border-top-color: transparent;\n  border-bottom-color: transparent;\n  border-left-color: transparent;\n\n  border-left-width: 0;\n  border-right-width: 50px;\n}\n\n.controls .next {\n  border-top-color: transparent;\n  border-bottom-color: transparent;\n  border-right-color: transparent;\n\n  border-left-width: 50px;\n  border-right-width: 0;\n}\n\n.controls .prev:hover {\n  border-right-color: #888;\n  cursor: pointer;\n}\n\n.controls .next:hover {\n  border-left-color: #888;\n  cursor: pointer;\n}\n\n.slide h1 {\n  font-size: 300%;\n  line-height: 1.2;\n  text-align: center;\n  margin: 170px 0 0;\n}\n\n.slide h2 {\n  font-size: 100%;\n  line-height: 1.2;\n  margin: 5px 0;\n  text-align: center;\n  font-weight: 200;\n}\n\n.slide h3 {\n  font-size: 140%;\n  line-height: 1.2;\n  border-bottom: 1px solid #aaa;\n  margin: 0;\n  padding-bottom: 15px;\n}\n\n.slide ul {\n  padding: 20px 0 0 60px;\n  font-weight: 200;\n  line-height: 1.375;\n}\n\n.slide .author h1.name {\n  font-size: 170%;\n  font-weight: 200;\n  text-align: center;\n  margin-bottom: 30px;\n}\n\n.slide .author h3 {\n  font-weight: 100;\n  text-align: center;\n  font-size: 95%;\n  border: none;\n}\n\na {\n  text-decoration: none;\n  color: #44a4dd;\n}\n\na:hover {\n  color: #66b5ff;\n}\n\npre {\n  font-size: 60%;\n  line-height: 1.3;\n}\n\n.progress {\n  position: fixed;\n  top: 0; left: 0; right: 0;\n  height: 3px;\n}\n\n.progress-bar {\n  width: 0%;\n  height: 3px;\n  background-color: #b4b4b4;\n\n  -webkit-transition: width 0.1s ease-out;\n  -moz-transition: width 0.1s ease-out;\n  -o-transition: width 0.1s ease-out;\n  transition: width 0.1s ease-out;\n}\n\n@media (max-width: 850px) {\n  #wrapper {\n    width: auto;\n  }\n\n  body {\n    font-size: 70%;\n  }\n\n  img {\n    width: 100%;\n  }\n\n  .slide h1 {\n    margin-top: 120px;\n  }\n\n  .controls .prev, .controls .prev:hover {\n    border-right-color: rgba(135, 135, 135, 0.5);\n  }\n\n  .controls .next, .controls .next:hover {\n    border-left-color: rgba(135, 135, 135, 0.5);\n  }\n}\n\n@media (max-width: 480px) {\n  body {\n    font-size: 50%;\n    overflow: hidden;\n  }\n\n  #wrapper {\n    margin-top: 10px;\n    height: 340px;\n  }\n\n  .slide {\n    padding: 10px;\n    height: 340px;\n  }\n\n  .slide h1 {\n    margin-top: 50px;\n  }\n\n  .slide ul {\n    padding-left: 25px;\n  }\n}\n\n@media print {\n  * {\n    -webkit-print-color-adjust: exact;\n  }\n\n  @page {\n    size: letter;\n  }\n\n  html {\n    width: 100%;\n    height: 100%;\n    overflow: visible;\n  }\n\n  body {\n    margin: 0 auto !important;\n    border: 0;\n    padding: 0;\n    float: none !important;\n    overflow: visible;\n    background: none !important;\n    font-size: 52%;\n  }\n\n  .progress, .controls {\n    display: none;\n  }\n\n  #wrapper {\n    overflow: visible;\n    height: 100%;\n    margin-top: 0;\n  }\n\n  .slide {\n    border: 1px solid #222;\n    margin-bottom: 40px;\n    height: 3.5in;\n  }\n\n  .slide:nth-child(odd) {\n    /* 2 slides per page */\n    page-break-before: always;\n  }\n}\n',
    githubStyle: '/*\ngithub.com style (c) Vasily Polovnyov <vast@whiteants.net>\n*/\n\ncode, pre {\n  border: 1px solid #ddd;\n  border-radius: 3px;\n  overflow: auto;\n  padding: 6px 10px;\n}\n\ncode {\n  padding: 0 5px;\n}\n\npre>code {\n  margin: 0; padding: 0;\n  border: none;\n  background: transparent;\n}\n\npre .comment,\npre .template_comment,\npre .diff .header,\npre .javadoc {\n  color: #998;\n  font-style: italic\n}\n\npre .keyword,\npre .css .rule .keyword,\npre .winutils,\npre .javascript .title,\npre .nginx .title,\npre .subst,\npre .request,\npre .status {\n  color: #333;\n  font-weight: bold\n}\n\npre .number,\npre .hexcolor,\npre .ruby .constant {\n  color: #099;\n}\n\npre .string,\npre .tag .value,\npre .phpdoc,\npre .tex .formula {\n  color: #d14\n}\n\npre .title,\npre .id {\n  color: #900;\n  font-weight: bold\n}\n\npre .javascript .title,\npre .lisp .title,\npre .clojure .title,\npre .subst {\n  font-weight: normal\n}\n\npre .class .title,\npre .haskell .type,\npre .vhdl .literal,\npre .tex .command {\n  color: #458;\n  font-weight: bold\n}\n\npre .tag,\npre .tag .title,\npre .rules .property,\npre .django .tag .keyword {\n  color: #000080;\n  font-weight: normal\n}\n\npre .attribute,\npre .variable,\npre .lisp .body {\n  color: #008080\n}\n\npre .regexp {\n  color: #009926\n}\n\npre .class {\n  color: #458;\n  font-weight: bold\n}\n\npre .symbol,\npre .ruby .symbol .string,\npre .lisp .keyword,\npre .tex .special,\npre .prompt {\n  color: #990073\n}\n\npre .built_in,\npre .lisp .title,\npre .clojure .built_in {\n  color: #0086b3\n}\n\npre .preprocessor,\npre .pi,\npre .doctype,\npre .shebang,\npre .cdata {\n  color: #999;\n  font-weight: bold\n}\n\npre .deletion {\n  background: #fdd\n}\n\npre .addition {\n  background: #dfd\n}\n\npre .diff .change {\n  background: #0086b3\n}\n\npre .chunk {\n  color: #aaa\n}\n',
    script: '/**\n * Takes the last slide and places it at the front.\n */\nfunction goBack() {\n  var wrapper = document.querySelector(\'#wrapper\');\n  var lastSlide = wrapper.lastChild;\n  while (lastSlide !== null && lastSlide.nodeType !== 1) {\n    lastSlide = lastSlide.previousSibling;\n  }\n\n  wrapper.removeChild(lastSlide);\n  wrapper.insertBefore(lastSlide, wrapper.firstChild);\n\n  setCurrentProgress();\n  updateURL();\n  updateTabIndex();\n}\n\n/**\n * Takes the first slide and places it at the end.\n */\nfunction goForward() {\n  var wrapper = document.querySelector(\'#wrapper\');\n  var firstSlide = wrapper.firstChild;\n  while (firstSlide !== null && firstSlide.nodeType !== 1) {\n    firstSlide = firstSlide.nextSibling;\n  }\n\n  wrapper.removeChild(firstSlide);\n  wrapper.appendChild(firstSlide);\n\n  setCurrentProgress();\n  updateURL();\n  updateTabIndex();\n}\n\n/**\n * Updates the current URL to include a hashtag of the current page number.\n */\nfunction updateURL() {\n  window.history.replaceState({} , null, \'#\' + currentPage());\n}\n\n/**\n * Returns the current page number of the presentation.\n */\nfunction currentPage() {\n  return document.querySelector(\'#wrapper .slide\').dataset.page;\n}\n\n/**\n * Returns a NodeList of each .slide element.\n */\nfunction allSlides() {\n  return document.querySelectorAll(\'#wrapper .slide\');\n}\n\n/**\n * Give each slide a "page" data attribute.\n */\nfunction setPageNumbers() {\n  var wrapper = document.querySelector(\'#wrapper\');\n  var pages   = wrapper.querySelectorAll(\'section\');\n  var page;\n\n  for (var i = 0; i < pages.length; ++i) {\n    page = pages[i];\n    page.dataset.page = i;\n  }\n}\n\n/**\n * Set the current progress indicator.\n */\nfunction setCurrentProgress() {\n  var wrapper = document.querySelector(\'#wrapper\');\n  var progressBar = document.querySelector(\'.progress-bar\');\n\n  if (progressBar !== null) {\n    var pagesNumber    = wrapper.querySelectorAll(\'section\').length;\n    var currentNumber  = parseInt(currentPage(), 10);\n    var currentPercent = pagesNumber === 1 ? 100 : 100 * currentNumber / (pagesNumber - 1);\n    progressBar.style.width = currentPercent.toString() + \'%\';\n  }\n}\n\n/**\n * Go to the specified page of content.\n */\nfunction goToPage(page) {\n  // Try to find the target slide.\n  var targetSlide = document.querySelector(\'#wrapper .slide[data-page="\' + page + \'"]\');\n\n  // If it actually exists, go forward until we find it.\n  if (targetSlide) {\n    var numSlides = allSlides().length;\n\n    for (var i = 0; currentPage() !== page && i < numSlides; i++) {\n      goForward();\n    }\n  }\n}\n\n/**\n * Removes tabindex property from all links on the current slide, sets\n * tabindex = -1 for all links on other slides. Prevents slides from appearing\n * out of control.\n */\nfunction updateTabIndex() {\n  var allLinks = document.querySelectorAll(\'.slide a\');\n  var currentPageLinks = document.querySelector(\'.slide\').querySelectorAll(\'a\');\n  var i;\n\n  for (i = 0; i < allLinks.length; i++) {\n    allLinks[i].setAttribute(\'tabindex\', -1);\n  }\n\n  for (i = 0; i < currentPageLinks.length; i++) {\n    allLinks[i].removeAttribute(\'tabindex\');\n  }\n}\n\nwindow.onload = function () {\n\n  // Give each slide a "page" data attribute.\n  setPageNumbers();\n\n  // Update the tabindex to prevent weird slide transitioning\n  updateTabIndex();\n\n  // If the location hash specifies a page number, go to it.\n  var page = window.location.hash.slice(1);\n  if (page) {\n    goToPage(page);\n  }\n\n  document.onkeydown = function (e) {\n    var kc = e.keyCode;\n\n    // left, down, H, J, backspace, PgUp - BACK\n    // up, right, K, L, space, enter, PgDn - FORWARD\n    if (kc === 37 || kc === 40 || kc === 8 || kc === 72 || kc === 74 || kc === 33) {\n      goBack();\n    } else if (kc === 38 || kc === 39 || kc === 13 || kc === 32 || kc === 75 || kc === 76 || kc === 34) {\n      goForward();\n    }\n  };\n\n  if (document.querySelector(\'.next\') && document.querySelector(\'.prev\')) {\n    document.querySelector(\'.next\').onclick = function (e) {\n      e.preventDefault();\n      goForward();\n    };\n\n    document.querySelector(\'.prev\').onclick = function (e) {\n      e.preventDefault();\n      goBack();\n    };\n  }\n\n};\n' 
  }

  function render(obj) {
    cleaver.external.loaded.document = obj.slides;
    if (obj.layout) {cleaver.templates.loaded.layout = obj.layout}
    if (obj.author_slide) {cleaver.templates.loaded.author = obj.author_slide}
    if (obj.agenda) {cleaver.templates.loaded.agenda = obj.agenda}
    if (obj.slides_layout) {cleaver.templates.loaded.slides = obj.slides_layout}
    if (obj.style) {cleaver.resources.loaded.style = obj.style}
    if (obj.githubStyle) {cleaver.resources.loaded.githubStyle = obj.githubStyle}
    if (obj.script) {cleaver.resources.loaded.script = obj.script}
    cleaver.slides = []
    cleaver.renderSlides()
    return cleaver.renderSlideshow()
  }
  return {
    render: render
  }
})

