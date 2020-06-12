const React = require('react');
const babel = require('@babel/core');
const { renderToStaticMarkup } = require('react-dom/server');
const mdx = require('@mdx-js/mdx');
const { MDXProvider, mdx: createElement } = require('@mdx-js/react');
require('@babel/preset-react');

exports.handler = async (event) => {
   const { content: articleContent } = JSON.parse(event.body);
   const content = await renderWithReact(articleContent);

   return {
      statusCode: 200,
      // headers: { 'Content-Type': 'text/html' },
      body: content,
   };
};

const transform = (code) =>
   babel.transformSync(code, {
      plugins: ['@babel/plugin-transform-react-jsx'],
   }).code;

const renderWithReact = async (mdxCode) => {
   const jsx = await mdx(mdxCode, { skipExport: true });
   // const code = transform(jsx);
   return jsx;
   const scope = { mdx: createElement };

   const fn = new Function(
      'React',
      ...Object.keys(scope),
      `${code}; return React.createElement(MDXContent)`
   );

   const element = fn(React, ...Object.values(scope));

   const elementWithProvider = React.createElement(MDXProvider, {}, element);

   return renderToStaticMarkup(elementWithProvider);
};
