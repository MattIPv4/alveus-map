# Alveus Sanctuary Interactive Map

Explore Alveus Sanctuary with an interactive map and find out more about the
different buildings on the property.

> <https://mattipv4.github.io/alveus-map/>

## Development

Make sure you have a version of Node.js that matches the `.nvmrc` file.

Install the dependencies for the project using `npm ci` to match the lock file.

Start the development server using `npm run dev`, this will watch for any
changes to `src` and rebuild the site, and make the site available at
<http://localhost:8080> by default.

This project uses the `sass` package to compile styling, `esbuild` to bundle
the JavaScript, and `posthtml` to generate the HTML. It makes use of the
`svg-pan-zoom` and `hammerjs` packages to provide the pan and zoom
functionality for the map, with `screenfull` to handle the fullscreen logic, as
well as the `markdown-it`, `markdown-it-link-attributes` and `grey-matter`
packages to render the content for each building's information overlay during
the build process.

Icons used are from the [Feather icons collection](https://feathericons.com/)
and are licensed under the
[MIT license](https://github.com/feathericons/feather/blob/master/LICENSE).

_Note: If you're looking to edit the map SVG itself, please reach out to me as
it is exported from a Figma file that acts as the source of truth, but is not
published in this repository._

### Testing and linting

This project makes use of `eslint` (with `eslint-plugin-import`) to maintain a
consistent style of code for the JavaScript, and `stylelint` (with
`stylelint-config-standard-scss` and `stylelint-order`) to maintain a
consistent style of code for the SCSS.

The linting for JavaScript can be run with `npm run test:js`. Many rules within
eslint support auto-fixing, and this can be invoked with `npm run test:js:fix`.

The linting for the SCSS styles can be run with `npm run test:scss`. Like with
eslint, many rules within stylelint support auto-fixing, and this can be run
with `npm run test:scss:fix`.

Linting for both can be run at the same time with `npm run test`, and
auto-fixing for both with `npm run test:fix`.

## Deployment

Like with development, ensure you have a correct version of Node.js installed
and have installed the project dependencies using `npm ci`.

Build the project using `npm run build`, and then serve the contents of `dist`
from your chosen static hosting provider.

## License

This project is licensed under the Apache License 2.0.

Copyright 2022 Matt Cowley.

Alveus Sanctuary logo is Copyright 2022 Alveus Sanctuary Inc.
