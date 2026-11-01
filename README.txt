Melody 107.7 FM website - setup
0. Add your logo as img/logo.png (the MELODY_LOGO_PNG.png file, renamed).
1. Create a GitHub repo named melody-website and upload everything in this folder.
2. In admin/config.yml replace YOUR-GITHUB-USERNAME with the station's GitHub username.
3. On netlify.com choose Add new site > Import from GitHub, pick the repo. Leave build command empty, publish directory "/".
4. In Netlify: Site configuration > Access & security > OAuth > Install provider (GitHub). Create a GitHub OAuth app as Netlify instructs and paste the Client ID and Secret.
5. Open yoursite.netlify.app/admin and log in with GitHub to edit the schedule and stories.
