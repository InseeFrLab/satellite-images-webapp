// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "CRaTT",
  dynamicPaths: [
    "/departement/:departement"
  ],
  pages: [
      {
        name: "Departements",
        path: "/departement/",
        pages: [
          {name: "Guadeloupe", path: "/departement/guadeloupe"},
          {name: "Guyane", path: "/departement/guyane"},
          {name: "La Réunion", path: "/departement/reunion"},
          {name: "Martinique", path: "/departement/martinique"},
          {name: "Mayotte", path: "/departement/mayotte"},
          {name: "Saint-Martin", path: "/departement/saint-martin"}
        ]
      },
      // {
      //   name: "Exemples minimaux",
      //   pages: [
      //     {name: "Selectinputs", path: "test"},
      //   ]
      // }
    ],
  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // cleanUrls: true, // drop .html from URLs
};
