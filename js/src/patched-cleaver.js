var Cleaver = require('cleaver')
var mustache = require('mustache')
Cleaver.prototype.renderSlideshow = function () {
  var putControls = this.metadata.controls || (this.metadata.controls === undefined);
  var putProgress = this.metadata.progress || (this.metadata.progress === undefined);
  var style, script;

  // Render the slides in a template (maybe as specified by the user)
  var slideshow = mustache.render(this.templates.loaded.slides, {
    slides: this.slides,
    controls: putControls,
    progress: putProgress
  });

  // TODO: handle defaults gracefully
  var title = this.metadata.title || 'Untitled';
  var encoding = this.metadata.encoding || 'utf-8';

  if (this.override && this.external.loaded.style) {
    style = this.external.loaded.style;
  } else {
    style = [
      this.resources.loaded.style,
      this.resources.loaded.githubStyle,
      this.external.loaded.style
    ].join('\n');
  }

  if (this.override && this.external.loaded.script) {
    script = this.external.loaded.script;
  } else {
    script = [
      this.resources.loaded.script,
      this.external.loaded.script
    ].join('\n');
  }

  var layoutData = {
    slideshow: slideshow,
    title: title,
    encoding: encoding,
    style: style,
    author: this.metadata.author,
    script: script,
    metadata: this.metadata
  };
  return mustache.render(this.templates.loaded.layout, layoutData);
};

module.exports = Cleaver