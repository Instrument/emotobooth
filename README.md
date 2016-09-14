# Emotobooth

Take photos, send them through the [Cloud Vision API](https://cloud.google.com/vision/?utm_source=google&utm_medium=cpc&utm_campaign=2015-q1-cloud-na-gcp-skws-freetrial-de&gclid=CIWg6uaB1cwCFYaWvAodgI8OxQ), and display the results of their Sentiment Analysis.

![panel](/imgs/panel.png)
![grid](/imgs/grid.png)
Check out the [full Twitter feed](https://twitter.com/gcpemotobooth)!

## The process

The `/in` directory watches for images being added; when the machine receives the "end session" signal, it scores the new set of images based on their results from the Cloud Vision API's Sentiment Analysis. The highest-scoring are sent to the frontend; all are processed on the backend.

## Config and Credentials

1. Duplicate the `config.js.example` file and rename it `config.js`.
1. Configure your ports and folder (these are relative to the `site` directory).
1. Create those folders in the project (for example, `in/' and 'out/').
1. Put your [API Key](https://console.cloud.google.com/apis/credentials) for the Cloud Vision API.

## Installation

* [Install Vagrant.](https://www.vagrantup.com/downloads.html)
* Set up the Vagrant VM.
```
cd deploy; vagrant up
```
* Provision the VM
```
vagrant provision
```
* **SKIP IF NOT ON WINDOWS** If you are on Windows and you plan to share socially, run these commands once for installation
```
vagrant ssh
cd /vagrant/site
npm uninstall phantomjs-prebuilt
npm install phantomjs-prebuilt --no-bin-links
node server.js
```
* Start the server
```
vagrant ssh
cd /vagrant/site
npm uninstall phantomjs-prebuilt
npm install phantomjs-prebuilt --no-bin-links
node server.js
```
* Load the [panel](http://localhost:8080) and [grid](http://localhost:8080?showgrid) front end pages (as seen above)

##Sessions

Photos can be grouped together in sessions. To send photos to the front end and/or share them socially, follow these steps.

1. Add photo(s) (with faces, this is about emotions, after all!) into your in directory (by default, `site/in`). This can be done automatically by setting this folder as the directory where a digital camera outputs photos.
2. Go to the [Keep/Kill](http://localhost:8080/buttons) page. To process the session, click on "Keep". To cancel session, click on "Kill". You will need to add more photos if you do this.
3. Watch the [panel](http://localhost:8080) and [grid](http://localhost:8080?showgrid) pages to see the output.
4. If you set up social sharing (see below), these sessions will be saved at this point.

## Optional Social Sharing

This experience can post to [Twitter](https://twitter.com/GCPEmotobooth/status/733065931027423232) and [Github](https://gist.github.com/GCPEmotobooth/2c36647dc2fba279aa250d12ce8cb472), letting users easily share their photos.

1. Duplicate the `credentials.js.example` file and rename it `credentials.js`.
1. Fill this out with your credentials from Twitter and Github.
1. From the terminal, run `ssh gist.github.com` to make sure you save your address to the known hosts.
1. Add the `share` flag when running the server, so `node server.js --share`.

## Endpoints

* `/` - Main screens (see query options below)
* `/buttons` - "Keep" ends a session; "Kill" throws out that session's photos.
* `/history` - Monitoring system to delete posts if necessary

## JSON & Grid Options

There are several querystrings that can be added to the main page's url to affect its appearance and behavior. Default behavior, i.e., what happens without a querystring, is what we would want in a production environment.

- `showgrid`: **the exception; we will want to use this on one of the production screens** shows the grid / historical view rather than the json / latest view.
- `zoom`: resize UI so panels can fit, based on width, in your window.
- `controls`: in json view, adds toolbar with shortcuts to taking certain photos to bottom of screen
- `dontprint`: tells the application not to render final photostrip to the `site/out-print` folder
- `prepopulate`: in grid view, uses pregenerated images to fill out grid if we don't actually have enough historical images to do so. Otherwise, only historical processed images will be used.
- Timing options: to speed up or skip steps of the sequence. Defaults to `normal`.
  - `timing=fast&`: all steps run, but faster than usual.
  - `timing=finalOnly&`: all steps are skipped; only final aura is rendered.
  - `timing=noFace&`: all face-related steps are skipped; only aura animates in.
  - `timing=noAura&`: all face-related steps run, and then the animation stops.
  - `timing=noChrome&`: all face and aura animations run, but chrome does not render.
- Event options: Emotobooth supports multiple designs for different events, these are added and handled inside of main.js, here are the currently supported events
  - `event=horizon`
  - `event=next`

## Frontend Details

All files that you work with to create the frontend should live in `site/ui/`.
The exception is `site/start.js`, which provides a hook into webpack for js and
css. Everything is compiled into `site/build/main.js`.

For your changes to be picked up, get in the `/site` folder (on the VM or on the host machine) and run `npm run watch`.

SCSS is flat. Any files that are *only* imported have names
prefixed with an underscore.

## Backend Details

### Backend image generation

We need to use PhantomJS to generate two additional sets of images.

To access a page that only displays one image at once, and no JSON element (i.e., ideal for backend image generation), go to `/single`.

1. Image with aura and chrome (for posting to social media) -- `/single&timing=finalOnly`
2. Image with aura _but not_ chrome (for displaying on the grid screen) -- `/single&timing=finalOnlyNoChrome`

### Display Backend
The display backend is a simple express webapp that:

1. serves the frontend (static files)
1. serves the processed images and simple JSON data about them via an API
1. provides a websocket to receive notifications of new images

#### Socket Testing
There is a simple socket test page that will alert when a job completes the
processing queue. To use it:

* run the server (`node server.js`)
* load the socket-test frontend (`open http://localhost:8080/socket-test.html`)
* process an image (`cp test.jpg /vagrant/site/in`)
* wait for the alert

### Image Processing
This is what you need to know to modify the job pipeline for images.

### Pipeline
The job pipeline is defined in `server.js` as the `jobMapping` object.  Each
job has a list of input events and output events.  A job is triggered by any of
the events in the `in` list.  When a job finishes, it will trigger events in the
`out` list, spawning any jobs that have those events in their `in` list.

The `newImage` job doesn't have any events in its `in` list.  `newImage` Jobs
are created by a filesystem watcher that looks for new images in the configured
directory and starts an image down the pipeline.

### Job
A job is a function that receives a job object as its first argument and a
finish callback as its second argument.  When calling the finish callback, the
data passed as the first argument will be available to the next job in the
pipeline as `job.data`.  The finish function must be called, even if there is
an error, or kue will think the job is hung.


### Image Processing Meta
This is what you need to know to work on the code that runs the job pipeline.

kue is a job queue, backed by redis to run jobs in the job pipeline. I broke up
the things that need to happen to an image into multiple functions. This was in
an attempt to make the pipeline easier to modify and to make the work invovled
easier to distribute over multiple cores.

In order to support jobs being able to trigger other jobs that run in parallel
and to support all of the work by these jobs culminating into a singular output
(the final image(s)), the pipeline supports branching and merging.  So, when
a job finishes (let's say JobA) and the output of this job feeds another job
(JobZ), JobZ can't necessarily run immediately.  There may be other jobs that
are necessary to complete before JobZ runs.  If JobZ depends on JobA, JobB, and
JobC, it needs to know when all of these are finished before it runs. So, there
is some management code that wraps the job functions that tracks this
information.

When JobA finishes, it will trigger the events in its `out` events.  When JobZ
gets this event, its wrapper function, `jobWrapper`, will make atomic
operations against redis to track how many of the prerequisite jobs have
completed. If it is the final job needed for JobZ to run, it will call the JobZ
function.  Otherwise, it simply finishes the job without actually calling the
JobZ function.

This wrapper function also handles triggering the appropriate events when a job
completes but creating a finishJob function that is passed to jobs as their
second argument.

Random note: kue can't have multiple callbacks assigned to a single event, so
two different jobs can't have the same `in` event assigned to them.


## Photostrip Printer Setup

The application is setup to create photostrips based off of each photo session, specific printer setup will vary, but below are tips for automatically printing folders as they are saved into the out-print folder.

### PC

#### Folder Agent:

Folder Agent watches the print folder and sends photostrips to the printer to be printed.

* Download Folder Agent from [http://www.folderagent.com](http://www.folderagent.com) and install it
* Open folder agent
* Create a new Folder Monitor
* Select the "site/out-print" folder from the Emotobooth application folder
* Click the + to add a new action
* Under the Execute tab, select PowerShellScript
* Replace the content with the following: ```C:\WINDOWS\System32\rundll32 C:\WINDOWS\System32\shimgvw.dll,ImageView_PrintTo "$path" "YOUR PRINTER NAME"```
* Click OK
* Add another action, under the Advanced tab select Sleep, Click Add
* Add another action, select Move File
* Click Move File and click the ... next to Destination Folder, click Insert and then Browse for folder
* Select or create the site/out-printed folder
* Click OK
* Click Save, if prompted about existing files, click Yes
* Leave Folder Agent running

### Mac

#### Automator:

* Open Automator
* Create a new Folder Action
* Choose the folder you would like the printer to watch
* on the left search Print and select Print Images
* Select the middle Orientation option and select Mitsubishi in printer
* Save
* Files will now print when they are saved into the folder

## Known Issues

* Adding files to the /in folder that are the same name as something already in the folder, will cause blank photos to be generated, please make sure to only place uniquely named photos into this directory
