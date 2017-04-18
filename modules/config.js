module.exports = {
'secret': 'ilovescotchyscotch',
'port':"3999",
'db': 'Test3999'
};

/*console.log(util.inspect(query, false,5,false));
docker run -d --name data -v c:/jayruanwork/app:/usr/share/app busybox
docker run -d --volumes-from=data --name mongo -p 27017:27017 jianyeruan/mongo /run.sh mongod --port 27017 --dbpath /data
docker run -it --volumes-from=data -p 3999:3999 --name node3999 --link mongo:mongo   -e APPPATH="onlineServer" --rm jianyeruan/node /run.sh supervisor app.js
docker run --volumes-from=data --link mongo:mongo -e APPPATH="onlineServer" --rm jianyeruan/node /run.sh node modules/createsuper.js
*/
