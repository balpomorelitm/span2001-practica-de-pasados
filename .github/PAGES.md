# GitHub Pages publication

The production site is the buildless `dist/` directory. Publish the contents of that directory at the root of the `gh-pages` branch. The default `main` branch retains the complete editable project.

The app uses relative assets and hash navigation, so it works at a project URL such as:

`https://balpomorelitm.github.io/span2001-practica-de-pasados/`

## Initial publication

Run the project checks before committing:

```powershell
npm test
npm run check
npm run check:ui
```

Create a public repository named `span2001-practica-de-pasados` under `balpomorelitm`, push `main`, and then publish the static subtree:

```powershell
git subtree split --prefix dist -b gh-pages
git push -u origin gh-pages
```

Configure GitHub Pages with the REST API. Its request body is:

```json
{
  "build_type": "legacy",
  "source": {
    "branch": "gh-pages",
    "path": "/"
  }
}
```

Use `POST /repos/balpomorelitm/span2001-practica-de-pasados/pages` for the first configuration. If Pages is already configured, inspect it and use `PUT` with the same body when a change is required.

The CLI can submit a UTF-8 JSON request file with `gh api --method POST repos/balpomorelitm/span2001-practica-de-pasados/pages --input <request-file>`. Never put credentials in that file or in the repository.

After GitHub finishes its Pages build, verify the returned `html_url`, the JavaScript and CSS files, and the generated illustration assets over HTTPS.

## Subsequent updates

Commit the edited project on `main`, run the checks, and publish the subtree without switching the working directory:

```powershell
git push origin main
git subtree split --prefix dist --branch gh-pages
git push origin gh-pages
```

This branch-based method works with the current GitHub CLI authentication and does not require the additional OAuth `workflow` scope. The `dist/.nojekyll` file bypasses Jekyll processing.

## Official references

- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
- [Custom GitHub Actions workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
