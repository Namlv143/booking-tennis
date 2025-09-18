# CI/CD Deployment Guide for Vercel

This guide explains how to set up automatic deployment to Vercel using GitHub Actions.

## 🚀 Quick Setup

### 1. Install Dependencies

First, install the new Vercel CLI dependency:

```bash
pnpm install
```

### 2. Get Vercel Tokens

You'll need to create a Vercel access token and get your project/organization IDs:

1. **Create Vercel Access Token:**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Click "Create Token"
   - Give it a name like "GitHub Actions Deploy"
   - Set expiration to "No Expiration" (or your preferred duration)
   - Copy the token value (starts with `vercel_`)

2. **Get Project and Organization IDs:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to your project
   - Go to **Settings** → **General**
   - Copy the **Project ID** (starts with `prj_`)
   - For Organization ID:
     - If using a team: Go to **Settings** → **General** → **Team ID** (starts with `team_`)
     - If personal account: Use your Account ID (starts with `user_`)

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VERCEL_TOKEN` | Your Vercel access token | Required for authentication |
| `VERCEL_ORG_ID` | Your Vercel Organization/Account ID | Required for project identification |
| `VERCEL_PROJECT_ID` | Your Vercel Project ID | Required for project identification |

### 4. Push to GitHub

Once everything is configured, push your changes to the main branch:

```bash
git add .
git commit -m "Add CI/CD pipeline for Vercel deployment"
git push origin main
```

## 🔄 How the CI/CD Works

### Production Deployment
- **Trigger**: Push to `main` branch
- **Process**: Build → Lint → Deploy to production
- **URL**: Your production domain

### Preview Deployment
- **Trigger**: Pull requests or pushes to non-main branches
- **Process**: Build → Lint → Deploy to preview environment
- **URL**: Generated preview URL (shared in PR comments)

## 📋 Available Scripts

After setup, you can use these npm scripts locally:

```bash
# Deploy to production
pnpm run deploy

# Deploy to preview
pnpm run deploy:preview

# Type checking
pnpm run type-check

# Build and preview locally
pnpm run build
pnpm run preview
```

## ⚙️ Configuration Files

### `.github/workflows/deploy.yml`
- Defines the GitHub Actions workflow
- Runs on pushes to main/master and pull requests
- Uses pnpm for dependency management
- Deploys to Vercel using the CLI

### `vercel.json`
- Vercel-specific configuration
- Optimized for Next.js deployment
- Includes API route settings and CORS headers
- Set to deploy from Singapore region (sin1)

### `package.json` Updates
- Added Vercel CLI as dev dependency
- Added deployment scripts
- Added type checking script

## 🔍 Monitoring Deployments

### GitHub Actions
- Check deployment status in **Actions** tab
- View build logs and deployment progress
- See preview URLs in pull request comments

### Vercel Dashboard
- Monitor deployment history
- View real-time logs
- Manage environment variables
- Configure custom domains

## 🛠️ Troubleshooting

### Common Issues

1. **Build fails on GitHub Actions**
   - Check that all dependencies are properly listed in `package.json`
   - Ensure Node.js version matches your local setup
   - Verify build scripts work locally

2. **Vercel deployment fails**
   - Check that `VERCEL_TOKEN` is valid and not expired
   - Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
   - Ensure project has proper permissions

3. **Preview deployments not working**
   - Check branch protection rules
   - Verify workflow triggers are set correctly
   - Ensure pull request events are enabled

### Useful Commands

```bash
# Check Vercel CLI status
pnpm dlx vercel --help

# List your Vercel projects
pnpm dlx vercel projects list

# Check deployment status locally
pnpm dlx vercel ls
```

## 📚 Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Next.js Integration](https://vercel.com/docs/frameworks/nextjs)

## 🤝 Support

If you encounter any issues:
1. Check the GitHub Actions logs for detailed error messages
2. Review Vercel deployment logs in the dashboard
3. Ensure all secrets are properly configured
4. Verify your repository has the necessary permissions
