#!/bin/bash

font=$(cd /usr/share/figlet/; ls *lf | egrep -v '(mnemonic|term|ivrit|digital)' | shuf -n1)
echo -e '\e[91m'
toilet -tf "$font" Photo Booth
echo -e '\e[39m'

cat << EOF

Hi.

The site should now be available at http://localhost:8080

To re-run salt:
  sudo salt-call --local state.highstate

Your history is primed with some basic commands. Ctrl-R to search through them.

More info to come. *YOU* can add info to this here:
deploy/salt/config/motd.txt

EOF
