'use strict';

var Twitter = require('twitter');
var GitHubApi = require("github");
var fs = require('fs');
var cp = require('child_process');

module.exports = {
  SocialPublisher: function(credentials, callback) {
    this.callback = callback;
    this.github = new GitHubApi({
      // required
      version: "3.0.0",
      // optional
      debug: false,
      protocol: "https",
      host: "api.github.com", // should be api.github.com for GitHub
      pathPrefix: "", // for some GHEs; none for GitHub
      timeout: 5000,
      headers: {
        "user-agent": "Query-It" // GitHub is happy with a unique user agent
      }
    });

    this.github.authenticate(credentials.GITHUB);

    this.twitter = new Twitter(credentials.TWITTER);

    this.uploadPhotos = function(id, sessionData) {
      let cmd = "/usr/bin/git clone git@gist.github.com:" + id + "; cd " + id + ";";
      let i = 0;
      for (let key in sessionData) {
        if (sessionData[key].finalPath) {
          cmd += " cp ../" + sessionData[key].finalPathChrome + " ./_photo" + (i++) + ".png;"
        }
      }
      cmd += " /usr/bin/git add .; /usr/bin/git commit -m 'n/a'; /usr/bin/git push; cd ..; rm -rf " + id + ";";
      cp.exec(cmd,
        function (error, stdout, stderr) {
          if (error !== null) {
            console.log('exec error: ' + error);
          }
        });
    }

    this.uploadTweet = function(gistUrl, sessionData) {
      var photoData = fs.readFileSync(
        sessionData[sessionData.highestScoredKey].finalPathChrome);
      this.twitter.post('media/upload', {media: photoData}, function(err, media, response){
        if (!err) {
          var status = {
            status: 'Thanks for visiting the @GCPEmotobooth! See all photos and data from this session → ' + gistUrl,
            media_ids: media.media_id_string
          }

          this.twitter.post('statuses/update', status, function(err, tweet, response){
            if (err) {
              console.log('TWITTER ERROR: ' + JSON.stringify(err, null, '  '));
            } else {
              sessionData.tweetId = tweet.id_str;
              this.callback(sessionData);
            }
          }.bind(this));
        } else {
          console.log('TWITTER ERROR: ' + JSON.stringify(err, null, '  '));
        }
      }.bind(this));
    }

    this.createGist = function(sessionData) {
      let files = {};

      var i = 0;
      for (let key in sessionData) {
        if (sessionData[key].respPath) {
          files['photo' + (i++) + '.json'] = {
            'content': JSON.stringify(JSON.parse(fs.readFileSync(sessionData[key].respPath, {encoding: 'utf8'})), null, '  ')
          }
        }
      }

      this.github.gists.create({
        'description': 'Google I/O photo session',
        'public': false,
        'files': files
      }, (err, res) => {
          console.log('GIST CREATED AT: ' + res.id);
          sessionData.gistId = res.id;
          this.callback(sessionData);
          this.uploadPhotos(res.id, sessionData);
          this.uploadTweet(res.html_url, sessionData);
      });
    }

    this.share = function(sessionData) {
      this.createGist(sessionData);
    }

    this.delete = function(gistId, tweetId) {
      this.github.gists.delete({
        id: gistId
      }, (err, res) => {
        if (err) {
          console.log('GIST ERROR: ' + err);
        }
      });

      this.twitter.post(`statuses/destroy/${tweetId}`, (err, res) => {
        if (err) {
          console.log('TWITTER ERROR: ' + JSON.stringify(err, null, '  '));
        }
      });
    }
  }
};
