git pull
bundle update
bundle exec jekyll build --trace --incremental
setopt localoptions rmstarsilent
apis-en git:(master) rm -f _site/feed.xml
git add --all
git commit --all -m general-update
git push