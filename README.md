# Emotobooth

Take photos, send them through the [Cloud Vision API](https://cloud.google.com/vision/?utm_source=google&utm_medium=cpc&utm_campaign=2015-q1-cloud-na-gcp-skws-freetrial-de&gclid=CIWg6uaB1cwCFYaWvAodgI8OxQ), and display the results of their Sentiment Analysis.

## git Practices

Default branch is `dev`. Anything on that branch should be stable; anything on `master` should be something we could show to the client / potentially release.

Merge into `dev` via PRs, which you are fine to close yourself.

Tag and create a new release when merging from `dev` into `master`.

Branch off of `dev`, unless you're creating a hotfix.

Todos are created as github issues; reference them in commits / PRs.

## The process

The `/in` directory watches for images being added; when the machine receives the "end session" signal, it scores the new set of images based on their results from the Cloud Vision API's Sentiment Analysis. The highest-scoring are sent to the frontend; all are processed on the backend.

## Quickstart

* [Install Vagrant.](https://www.vagrantup.com/downloads.html)

* Set up the Vagrant VM.
```
cd deploy; vagrant up
```

* Provision the VM
```
vagrant provision
```

* Load the processing and display server
```
vagrant ssh
cd /vagrant/site
node server.js
<output>
```

* Process an image (on the Vagrant)
```
cp test.jpg in/
```

OR copy an image to the `/in` directory on your host machine (the VM will see this).

* File will process
```
file /vagrant/site/out/test.png
```

* Observe job queue at [http://localhost:8081](http://localhost:8081)

* To end the session and send the highest-scoring images to the frontend, press the "Keep" button on the [buttons page](http://localhost:8080/buttons).

* After session is over, up to three images and their response JSON will animate in on the [main display](http://localhost:8080/) and the top image will become the hero on the [grid display](http://localhost:8080/?showgrid).

## Endpoints

* `/` - Main screens (see query options below)
* `/buttons` - "Keep" ends a session; "Kill" throws out that session's photos.
* `/history` - Monitoring system to delete posts if necessary

## JSON & Grid Options

There are several querystrings that can be added to the main page's url to affect its appearance and behavior. Default behavior, i.e., what happens without a querystring, is what we would want in a production environment.

- `showgrid`: **the exception; we will want to use this on one of the production screens** shows the grid / historical view rather than the json / latest view.
- `zoom`: resize UI so panels can fit, based on width, in your window.
- `controls`: in json view, adds toolbar with shortcuts to taking certain photos to bottom of screen
- `prepopulate`: in grid view, uses pregenerated images to fill out grid if we don't actually have enough historical images to do so. Otherwise, only historical processed images will be used.
- Timing options: to speed up or skip steps of the sequence. Defaults to `normal`.
  - `timing=fast&`: all steps run, but faster than usual.
  - `timing=finalOnly&`: all steps are skipped; only final aura is rendered.
  - `timing=noFace&`: all face-related steps are skipped; only aura animates in.
  - `timing=noAura&`: all face-related steps run, and then the animation stops.
  - `timing=noChrome&`: all face and aura animations run, but chrome does not render.

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
