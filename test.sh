#!/bin/sh
#sed -i 's/173.244.222.167/192.168.1.100/g' /usr/share/app/node/nodeapi/js/app.js
if [ "$1" == "test" ]; then
	echo "You have access!"
else
	echo "ACCESS DENIED!"
fi
#docker exec -it nodejs /usr/share/app/node/nodeapi/test.sh