# GitHub Setup Guide

Follow these steps to push your **Hamro G&G Auto Enterprises** project to GitHub.

## 1. Initialize Git
Open your local terminal in the project root and run:
```bash
git init
```

## 2. Add and Commit
Stage all your files and create the first commit:
```bash
git add .
git commit -m "Initial commit: Professional Auto Resale Platform"
```

## 3. Create Repository
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `hamro-gg-auto`).
3. Click **Create repository**.

## 4. Link and Push
Copy the commands from GitHub's "push an existing repository" section, or use these (replace with your URL):
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

> **Security Note:** Your `.env` file is already listed in `.gitignore` to prevent your Firebase keys from being exposed publicly.