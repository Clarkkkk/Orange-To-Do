# 构建
echo "### npm run build ###"
npm run build

# cd 到构建输出的目录下 
echo "### git deploying ###"
cd dist

git init
git add -A
git commit -m 'deploy'

echo "### git pushing ###"
git push -f https://github.com/Clarkkkk/Orange-To-Do-Page.git master

cd..
echo "### complete ###"
