# Workflow templates

These are the recommended GitHub Actions workflows for SmartLoop.

They live here (not in `workflows/`) because the deploy PAT used to push the
initial commit does not have the `workflow` scope. To enable them:

```bash
# Either via web UI (drag-and-drop into Actions tab)
# or via git after rotating to a PAT with `workflow` scope:

cd .github
mv workflows-templates/ci.yml workflows/ci.yml
mv workflows-templates/docker.yml workflows/docker.yml
git add workflows/
git commit -m "ci: enable CI + Docker workflows"
git push
```

## Files

- `ci.yml` — lint, type check, and Postgres-backed API smoke boot on every PR
- `docker.yml` — builds and publishes API image to `ghcr.io/Binzaga/smartloop-api`
