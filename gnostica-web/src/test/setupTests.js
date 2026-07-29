import '@testing-library/jest-dom';

if (typeof Element !== 'undefined' && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function scrollTo(options) {
    if (options && typeof options.top === 'number') {
      this.scrollTop = options.top;
    }
  };
}
