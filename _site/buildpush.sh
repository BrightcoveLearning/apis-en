git pull
bundle update
bundle exec jekyll build --trace --incremental
setopt localoptions rmstarsilent
rm -f _site/feed.xml
echo 'Enter your commit message:'
read COMMITMESSAGE
echo Your client id: $CLIENT_ID
git add --all
git commit --all -m $COMMITMESSAGE
git push