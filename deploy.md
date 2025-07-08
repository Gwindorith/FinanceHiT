# Deployment Instructions

## Option 1: Vercel (Recommended - Free)

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click "New Project"
3. Import your GitHub repository (you'll need to push this to GitHub first)
4. Vercel will automatically detect it's a Next.js app
5. Click "Deploy"
6. Your app will be live at: `https://your-project-name.vercel.app`

## Option 2: Netlify (Free)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `.next`
6. Click "Deploy site"

## Option 3: Render (Free)

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New Web Service"
3. Connect your GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Click "Create Web Service"

## Push to GitHub First

Before deploying, you need to push this to GitHub:

```bash
# Create a new repository on GitHub.com
# Then run these commands:

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Important Notes

- The app uses SQLite for the database, which will be reset on each deployment
- For production, consider using a proper database like PostgreSQL
- All data will be temporary and will be lost when the service restarts 