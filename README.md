FakkuDownloader
===============

Download From fakku via command line

# Current Feature
 - Download from Fakku.net
 - Show Downloaded
 - Downloaded manga stored in folder downloads

# Change Logs
 - v0.3.1
   - fix crash on pagination
   
 - v0.3
   - change --search command from search downloaded manga to search from fakku
   - add pagination

 - v0.2
   - add --tags command, search manga by tags
 
 - v0.1
   - initial release
   - add news command, search newest manga
   - add --search, search downloaded manga

# TODO
 - give proper instruction to install and use this application
 - add info for downloaded manga ( artist, translator, total pages, tags, etc )
 - remove downloaded manga
 - add more features
 
# How to Install
 - Download and Install NodeJS
 - Download ( or clone ) this 
 - open Downloaded folder in command line ( Shift + right click -> Open Command Window here, for windows user )
 - run "node install" without (") and wait to install all dependency
 - then run "node app.js {command_here}" without (")
 
# Current Command
 - --news : get all manga from Fakku and you can choose what manga you want to download
 
 - --search="keyword" or -S "keyword" : search manga from Fakku

 - --tags or -T : search manga based on choosen tags
