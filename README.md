# Emotobooth

Take photos, send them through the [Cloud Vision API](https://cloud.google.com/vision/?utm_source=google&utm_medium=cpc&utm_campaign=2015-q1-cloud-na-gcp-skws-freetrial-de&gclid=CIWg6uaB1cwCFYaWvAodgI8OxQ), and display the results of their Sentiment Analysis.

![panel](/imgs/panel.png)
![grid](/imgs/grid.png)
Check out the [full Twitter feed](https://twitter.com/gcpemotobooth)!

## The process

The `/in` directory watches for images being added; when the machine receives the "end session" signal, it scores the new set of images based on their results from the Cloud Vision API's Sentiment Analysis. The highest-scoring are sent to the frontend; all are processed on the backend.

## Config and Credentials

1. Duplicate the `site/config.js.example` file and rename it `site/config.js`.
1. Configure your ports and folder (these are relative to the `site` directory).
1. Create those folders in the project (for example, `in/' and 'out/').
1. Put your [API Key](https://console.cloud.google.com/apis/credentials) for the Cloud Vision API.

### (For "Horizon" computers only)
1. Update the `config` directory for further configurable values.
2. In `config.shl`, update your event name, git branch to auto pull from, and custom tweet
3. Add your logo to print on photostrips as `logo.png`

## Installation

* [Install Vagrant.](https://www.vagrantup.com/downloads.html)
* Set up the Vagrant VM.
```
cd deploy
```
then
```
vagrant up
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
```
* Start the server
```
vagrant ssh
cd /vagrant/site
node server.js
```
* Load the [panel](http://localhost:8080) (`localhost:8080`) and [grid](http://localhost:8080?showgrid) (`localhost:8080?showgrid`) front end pages. 

**Note:** you will see blank gray pages for both the panel and grid view (this is expected behavior) until uniquely named photos are added to the `site/in` folder, and the end of a session is triggered (the "Keep" button is clicked on `localhost:8080/buttons`). Continue reading for more information on set up.

## Sessions

Photos can be grouped together in sessions. To send photos to the front end and/or share them socially, follow these steps.

1. Add photo(s) (with faces, this is about emotions, after all!) into your in directory (by default, `site/in`). This can be done automatically by setting this folder as the directory where a digital camera outputs photos. You can manually add photos to this folder as well, by simply dragging and dropping them in. Please note that all images in `/in` must have _unique file names_ to trigger the API. 
2. Go to the [Keep/Kill](http://localhost:8080/buttons) (`localhost:8080/buttons`) page. To process the session, click on "Keep". To cancel session, click on "Kill" (you will need to add more photos if you kill the session).
3. Watch the [panel](http://localhost:8080) (`localhost:8080`) and [grid](http://localhost:8080?showgrid) (`http://localhost:8080?showgrid`) pages to see the output from the session.
4. If you set up social sharing (see below), these sessions will be saved at this point.

## Optional Social Sharing

This experience can post to [Twitter](https://twitter.com/GCPEmotobooth/status/733065931027423232) and [GitHub](https://gist.github.com/GCPEmotobooth/2c36647dc2fba279aa250d12ce8cb472), letting users easily share their photos.

1. Duplicate the `credentials.json.example` file and rename it `credentials.json`.
2. Fill out `credentials.json` with your credentials from Twitter and Github.
3. From the terminal, run `ssh gist.github.com` to make sure you save your address to the known hosts.
4. Add the `share` flag when running the server, so `node server.js --share` (vs. `node server.js`).

## Endpoints

* `/` - Main screens (see query options below)
* `/buttons` - "Keep" ends a session; "Kill" throws out that session's photos.
* `/history` - Monitoring system to delete posts if necessary

## JSON Panel and Grid Options

There are several query string parameters that can be used to affect the panel and grid page's display. Default behavior (what happens without a query string) can be considered a default for the production environment, with the exception of the grid view (which can only be seen at `localhost:8080?showgrid`)

Multiple query string parameters can be combined to customize the display. For example, the grid view might be configured as follows to prepopulate it with images and zoom the display: `localhost:8080?showgrid&prepopulate&zoom`. If you wanted to show the panel view _without_ the bottom chrome (hiding the white bottom bar with emotion color indicator dots) you can configure that view as follows: `http://localhost:8080/?timing=noChrome&`.

Query string parameters:

- `showgrid`: **the exception; we will want to use this on one of the production screens** shows the "grid"/historical view rather than the "panel" (photo + JSON) view.
- `zoom`: resizes the UI so panels can fit, based on width, in the browser window.
- `controls`: in panel view, adds a toolbar with shortcuts to taking certain photos to bottom of screen
- `dontprint`: tells the application not to render final photostrip to the `site/out-print` folder
- `prepopulate`: in grid view, use pregenerated images to fill out the grid if we don't actually have enough historical images to do so. Otherwise, only historical processed images will be displayed.
- Timing options for panel view, to speed up or skip steps of the sequence (defaults to `normal`).
  - `timing=fast&`: all steps run, but faster than usual.
  - `timing=finalOnly&`: all steps are skipped; only final aura is rendered.
  - `timing=noFace&`: all face-related steps are skipped; only aura animates in.
  - `timing=noAura&`: all face-related steps run, and then the animation stops.
  - `timing=noChrome&`: all face and aura animations run, but image chrome does not render.
- Event options: Emotobooth supports multiple designs for different events (these are added and handled inside of main.js). Some events include:
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

PhantomJS is used to generate two additional sets of images.

To access a page that only displays one image at once, and no JSON element (ideal for backend image generation), go to `/single`.

1. Image with aura and chrome (for posting to social media) -- `/single&timing=finalOnly`
2. Image with aura _but not_ chrome (for displaying on the grid screen) -- `/single&timing=finalOnlyNoChrome`

### Display Backend
The display backend is a simple express webapp that:

1. serves the frontend (static files)
2. serves the processed images and their JSON data via API
3. provides a websocket to receive notifications of new images

#### Socket Testing
There is a simple socket test page that will alert when a job completes the
processing queue. To use it:

* run the server (`node server.js`)
* load the socket-test frontend (`open http://localhost:8080/socket-test.html`)
* process an image (`cp test.jpg /vagrant/site/in`)
* wait for the alert

### Image Processing
To modify the job pipeline for images, please review the following information.

### Pipeline
The job pipeline is defined in `server.js` as the `jobMapping` object.  Each
job has a list of input events and output events.  A job is triggered by any of
the events in the `in` list.  When a job finishes, it will trigger events in the
`out` list, spawning any jobs that have those events in their `in` list.

The `newImage` job doesn't have any events in its `in` list. `newImage` Jobs
are created by a filesystem watcher that looks for new images in the configured
directory and starts an image down the pipeline.

### Job
A job is a function that receives a job object as its first argument and a
finish callback as its second argument. When calling the finish callback, the
data passed as the first argument will be available to the next job in the
pipeline as `job.data`. The finish function must be called, even if there is
an error, or kue will think the job is hung.


### Image Processing Meta
Continue reading for information regarding the code that runs the job pipeline.

"kue" is a job queue, backed by redis to run jobs in the job pipeline. The things
that need to happen to an image are broken up into multiple functions. This makes
the pipeline easier to modify, so the work invovled is easier to distribute over
multiple cores.

In order to support jobs being able to trigger other jobs that run in parallel
and to support all of the work by these jobs culminating into a singular output
(the final image(s)), the pipeline supports branching and merging. So, when
a job finishes (let's say JobA) and the output of this job feeds another job
(JobZ), JobZ can't necessarily run immediately.  There may be other jobs that
are necessary to complete before JobZ runs. If JobZ depends on JobA, JobB, and
JobC, it needs to know when all of these are finished before it runs. For this
reason there is some management code that wraps the job functions to track 
this information.

When JobA finishes, it will trigger the events in its `out` events. When JobZ
gets this event, its wrapper function, `jobWrapper`, will make atomic
operations against redis to track how many of the prerequisite jobs have
completed. If it is the final job needed for JobZ to run, it will call the JobZ
function. Otherwise, it simply finishes the job without actually calling the
JobZ function.

This wrapper function also handles triggering the appropriate events when a job
completes by creating a finishJob function that is passed to jobs as their
second argument.

Random note: kue can't have multiple callbacks assigned to a single event, so
two different jobs can't have the same `in` event assigned to them.


## Photostrip Printer Setup

The application is set up to create photostrips based off of each photo session. The specific printer setup will vary, but below are some tips for automatically printing as images are saved into the out-print folder.

### PC

#### Folder Agent:

Folder Agent watches the print folder, and sends photostrips to the printer to be printed.

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

* Adding files to the `/in` folder that are the same name as something already in the folder will cause blank photos to be generated. Please make sure to only place _uniquely named photos_ into this directory.
