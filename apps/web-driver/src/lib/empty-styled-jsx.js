// Empty styled-jsx replacement module
// This module replaces styled-jsx to prevent React 19 compatibility issues

// Export empty functions to match styled-jsx API
module.exports = {
  StyleRegistry: function StyleRegistry({ children }) {
    return children;
  },
  style: function style() {
    return {};
  },
  css: function css() {
    return '';
  },
  resolve: function resolve() {
    return { className: '', styles: null };
  }
};

// Default export
module.exports.default = module.exports.StyleRegistry;
