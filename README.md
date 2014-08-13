FakkuDownloader
===============

Download From fakku via command line

# Current Feature :
 - Download from Fakku.net
 - Show Downloaded
 - Downloaded manga stored in folder downloads

# Change Logs
 - v0.2
   - add --tags command, search manga by tags
 
 - v0.1
   - initial release
   - add news command, search newest manga
   - add --search, search downloaded manga

# TODO :
 - change current --search command to --downloaded
 - search manga feature ( --search )
 - remove downloaded manga
 - add more features
 
# How to Install
 - Download and Install NodeJS
 - Download ( or clone ) this 
 - open Downloaded folder in command line ( Shift + right click -> Open Command Window here, for windows user )
 - run "node install" without (") and wait to install all dependency
 - then run "node app.js {command_here}" without (")
 
# Current Command
 - news : get all manga from Fakku and you can choose what manga you want to download
   ![node app.js news](http://fat.gfycat.com/GenerousWelcomeEarthworm.gif)
 
 - --search=keyword or -S keyword : to search all downloaded manga ( if keyword leave blank, it will list all downloaded mangas)
   ![node app.js -S keyword](http://zippy.gfycat.com/ShortCreepyGoat.gif)

 - --tags or -T : search manga based on choosen tags
